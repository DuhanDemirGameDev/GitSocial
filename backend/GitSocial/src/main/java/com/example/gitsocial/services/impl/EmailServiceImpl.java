package com.example.gitsocial.services.impl;

import com.example.gitsocial.services.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Override
    public void sendPasswordResetEmail(String to, String resetLink, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("GitSocial - Sifre Sifirlama Talebi");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;\">"
                    + "<h2 style=\"color: #1f2937; text-align: center;\">Git<span style=\"color: #2563eb;\">Social</span></h2>"
                    + "<h3 style=\"color: #374151;\">Sifre Sifirlama Talebi</h3>"
                    + "<p style=\"color: #4b5563; font-size: 16px;\">Merhaba,</p>"
                    + "<p style=\"color: #4b5563; font-size: 16px;\">Hesabinizin sifresini sifirlamak icin bir talepte bulundunuz. Asagidaki butona tiklayarak yeni sifrenizi belirleyebilirsiniz:</p>"
                    + "<div style=\"text-align: center; margin: 30px 0;\">"
                    + "<a href=\"" + resetLink + "\" style=\"display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;\">Sifremi Sifirla</a>"
                    + "</div>"
                    + "<p style=\"color: #6b7280; font-size: 14px;\">Bu baglanti guvenlik geregi <strong>15 dakika</strong> boyunca gecerlidir.</p>"
                    + "<p style=\"color: #6b7280; font-size: 14px;\">Eger bu islemi siz baslatmadiysaniz, hesabinizi guvende kabul edebilirsiniz ve bu e-postayi dikkate almayabilirsiniz.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("SMTP not configured. Generated reset token: {}", token, e);
        }
    }
}
