package com.example.gitsocial.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.gitsocial.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
            "image/tiff",
            "image/bmp"
    );

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.upload-folder}")
    private String uploadFolder;

    @Value("${app.cloudinary.max-file-size-bytes}")
    private long maxFileSizeBytes;

    @Override
    @Async("cloudinaryTaskExecutor")
    public CompletableFuture<String> uploadImageAsync(MultipartFile file) {
        validateFile(file);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", uploadFolder,
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary did not return a secure URL.");
            }

            return CompletableFuture.completedFuture(secureUrl.toString());
        } catch (IOException ex) {
            throw new IllegalStateException("Image upload failed while reading the file.", ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Image upload to Cloudinary failed.", ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded image file cannot be empty.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("Image file size cannot exceed 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Unsupported image type.");
        }
    }
}
