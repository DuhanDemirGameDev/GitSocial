package com.example.gitsocial.services.impl;

import com.example.gitsocial.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true parametresi, HTML formatlı mesaj göndereceğimizi belirtir
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("GitSocial - Şifre Sıfırlama Talebi");

            // SRS belgesine uygun kurumsal HTML şablonu
            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;\">"
                    + "<h2 style=\"color: #1f2937; text-align: center;\">Git<span style=\"color: #2563eb;\">Social</span></h2>"
                    + "<h3 style=\"color: #374151;\">Şifre Sıfırlama Talebi</h3>"
                    + "<p style=\"color: #4b5563; font-size: 16px;\">Merhaba,</p>"
                    + "<p style=\"color: #4b5563; font-size: 16px;\">Hesabınızın şifresini sıfırlamak için bir talepte bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>"
                    + "<div style=\"text-align: center; margin: 30px 0;\">"
                    + "<a href=\"" + resetLink + "\" style=\"display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;\">Şifremi Sıfırla</a>"
                    + "</div>"
                    + "<p style=\"color: #6b7280; font-size: 14px;\">Bu bağlantı güvenlik gereği <strong>15 dakika</strong> boyunca geçerlidir.</p>"
                    + "<p style=\"color: #6b7280; font-size: 14px;\">Eğer bu işlemi siz başlatmadıysanız, hesabınız güvendedir ve bu e-postayı dikkate almayabilirsiniz.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new IllegalStateException("E-posta gönderimi başarısız oldu", e);
        }
    }
}