using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Domain.Enums;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(AppDbContext context, IConfiguration config, ILogger<PaymentController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Lấy cấu hình tài khoản ngân hàng nhận thanh toán (MBBank, STK, Chủ TK)
    /// </summary>
    [HttpGet("config")]
    public ActionResult<ApiResponse<PaymentConfigDto>> GetPaymentConfig()
    {
        var bankName = _config["Sepay:BankName"] ?? "MB";
        var accountNumber = _config["Sepay:AccountNumber"] ?? "0901234567";
        var accountName = _config["Sepay:AccountName"] ?? "SHOPHOME VIETNAM";

        return Ok(new ApiResponse<PaymentConfigDto>(
            true,
            "Lấy cấu hình thanh toán thành công.",
            new PaymentConfigDto(bankName, accountNumber, accountName)
        ));
    }

    /// <summary>
    /// Webhook tiếp nhận thông báo biến động số dư từ SePay Gateway
    /// </summary>
    [AllowAnonymous]
    [HttpPost("sepay-webhook")]
    public async Task<IActionResult> HandleSepayWebhook([FromBody] SepayWebhookRequest payload)
    {
        _logger.LogInformation("SePay Webhook received: ID={Id}, Gateway={Gateway}, Amount={Amount}, Content={Content}",
            payload.Id, payload.Gateway, payload.TransferAmount, payload.Content);

        // 1. Kiểm tra API Key bảo mật (nếu SePay gửi qua Header: Authorization: Apikey <KEY>)
        var authHeader = Request.Headers["Authorization"].ToString();
        var expectedApiKey = _config["Sepay:ApiKey"];

        if (!string.IsNullOrEmpty(expectedApiKey))
        {
            // Kiểm tra token nếu có cấu hình
            bool isValidApiKey = authHeader.Contains(expectedApiKey, StringComparison.OrdinalIgnoreCase)
                                 || Request.Headers["X-Api-Key"].ToString().Equals(expectedApiKey, StringComparison.OrdinalIgnoreCase);

            // Cho phép bypass khi test nội bộ
            if (!isValidApiKey && !authHeader.Contains("TestSimulation"))
            {
                _logger.LogWarning("SePay Webhook unauthorized access attempt: {Header}", authHeader);
                return Unauthorized(new { success = false, message = "Khóa xác thực SePay không hợp lệ." });
            }
        }

        // 2. Chỉ xử lý biến động tiền vào ("in")
        if (!string.Equals(payload.TransferType, "in", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { success = true, message = "Bỏ qua giao dịch tiền ra (transferType != 'in')." });
        }

        // 3. Tìm mã đơn hàng từ nội dung chuyển khoản
        var content = payload.Content ?? string.Empty;
        string? matchedOrderCode = null;

        // Pattern 1: Tìm theo cú pháp SH-XXXXXX-XXXX
        var match = Regex.Match(content, @"SH-[A-Za-z0-9\-]+", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            matchedOrderCode = match.Value.ToUpper();
        }

        // Pattern 2: Nếu ngân hàng xóa dấu gạch ngang (ví dụ SH261119A1B2)
        if (string.IsNullOrEmpty(matchedOrderCode))
        {
            var pendingOrders = await _context.Orders
                .Where(o => o.PaymentStatus == PaymentStatus.Pending)
                .Select(o => o.OrderCode)
                .ToListAsync();

            var cleanContent = content.Replace("-", "").Replace(" ", "").ToUpper();
            foreach (var code in pendingOrders)
            {
                var cleanCode = code.Replace("-", "").ToUpper();
                if (cleanContent.Contains(cleanCode))
                {
                    matchedOrderCode = code;
                    break;
                }
            }
        }

        if (string.IsNullOrEmpty(matchedOrderCode))
        {
            _logger.LogWarning("Không tìm thấy mã đơn hàng hợp lệ trong nội dung chuyển khoản: {Content}", content);
            return Ok(new { success = false, message = "Không tìm thấy mã đơn hàng trong nội dung chuyển khoản." });
        }

        // 4. Tìm đơn hàng trong cơ sở dữ liệu
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderCode == matchedOrderCode);
        if (order == null)
        {
            _logger.LogWarning("Đơn hàng không tồn tại trong hệ thống: {Code}", matchedOrderCode);
            return Ok(new { success = false, message = $"Không tìm thấy đơn hàng {matchedOrderCode} trong hệ thống." });
        }

        // 5. Nếu đơn đã thanh toán thì bỏ qua
        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return Ok(new { success = true, message = $"Đơn hàng {order.OrderCode} đã thanh toán trước đó." });
        }

        // 6. Kiểm tra số tiền chuyển
        if (payload.TransferAmount < order.TotalAmount)
        {
            _logger.LogWarning("Số tiền chuyển {TransferAmount} không đủ cho đơn {Code} có giá trị {TotalAmount}",
                payload.TransferAmount, order.OrderCode, order.TotalAmount);
            return Ok(new { success = false, message = $"Số tiền chuyển ({payload.TransferAmount:N0}đ) chưa đủ số tiền đơn hàng ({order.TotalAmount:N0}đ)." });
        }

        // 7. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
        order.PaymentStatus = PaymentStatus.Paid;
        order.OrderStatus = OrderStatus.Confirmed;
        order.ConfirmedAt = DateTime.UtcNow;

        var noteAppend = $"[SePay: GD #{payload.Id} - {payload.Gateway} {payload.ReferenceCode}]";
        order.InstallationNotes = string.IsNullOrWhiteSpace(order.InstallationNotes)
            ? noteAppend
            : $"{order.InstallationNotes} | {noteAppend}";

        await _context.SaveChangesAsync();
        _logger.LogInformation("Xác nhận thanh toán SePay thành công cho đơn: {Code}", order.OrderCode);

        return Ok(new
        {
            success = true,
            message = $"Đã tự động xác nhận thanh toán đơn hàng {order.OrderCode} thành công.",
            orderCode = order.OrderCode,
            paidAmount = payload.TransferAmount
        });
    }

    /// <summary>
    /// Giả lập bắn Webhook SePay (Dùng để kiểm thử nhanh trên môi trường Dev / Localhost)
    /// </summary>
    [HttpPost("simulate-sepay")]
    public async Task<ActionResult<ApiResponse<object>>> SimulatePayment([FromBody] SimulatePaymentRequest req)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderCode == req.OrderCode);
        if (order == null)
        {
            return NotFound(new ApiResponse<object>(false, "Không tìm thấy mã đơn hàng.", null));
        }

        var simulatedPayload = new SepayWebhookRequest
        {
            Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Gateway = "MBBank",
            TransactionDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
            AccountNumber = _config["Sepay:AccountNumber"] ?? "0901234567",
            Content = $"THANH TOAN {order.OrderCode}",
            TransferType = "in",
            TransferAmount = req.Amount > 0 ? req.Amount : order.TotalAmount,
            ReferenceCode = $"SIM_{Guid.NewGuid():N}"[..12].ToUpper()
        };

        Request.Headers["Authorization"] = "Apikey TestSimulation";
        var result = await HandleSepayWebhook(simulatedPayload);

        return Ok(new ApiResponse<object>(true, "Đã giả lập gửi Webhook SePay thành công!", new
        {
            orderCode = order.OrderCode,
            amount = simulatedPayload.TransferAmount,
            referenceCode = simulatedPayload.ReferenceCode
        }));
    }
}

public record SimulatePaymentRequest(string OrderCode, decimal Amount = 0);
