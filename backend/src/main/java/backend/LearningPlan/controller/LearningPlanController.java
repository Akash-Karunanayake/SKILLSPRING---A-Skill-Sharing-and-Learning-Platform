package backend.LearningPlan.controller;

import backend.exception.ResourceNotFoundException;
import backend.LearningPlan.model.LearningPlanModel;
import backend.LearningPlan.repository.LearningPlanRepository;
import backend.User.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningPlanController {
    @Autowired
    private LearningPlanRepository learningPlanRepository;

    private final Path root = Paths.get("uploads/plan");

    @Autowired
    private UserRepository userRepository;

    // Insert
    @PostMapping("/learningPlan")
    public LearningPlanModel newLearningSystemModel(@RequestBody LearningPlanModel newLearningPlanModel) {
        System.out.println("Received data: " + newLearningPlanModel);
        if (newLearningPlanModel.getPostOwnerID() == null || newLearningPlanModel.getPostOwnerID().isEmpty()) {
            throw new IllegalArgumentException("PostOwnerID is required.");
        }
        String postOwnerName = userRepository.findById(newLearningPlanModel.getPostOwnerID())
                .map(user -> user.getFullname())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for ID: " + newLearningPlanModel.getPostOwnerID()));
        newLearningPlanModel.setPostOwnerName(postOwnerName);

        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        newLearningPlanModel.setCreatedAt(currentDateTime);

        return learningPlanRepository.save(newLearningPlanModel);
    }

    @PostMapping("/learningPlan/planUpload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/learningPlan")
    List<LearningPlanModel> getAll() {
        List<LearningPlanModel> posts = learningPlanRepository.findAll();
        posts.forEach(post -> {
            if (post.getPostOwnerID() != null) {
                String postOwnerName = userRepository.findById(post.getPostOwnerID())
                        .map(user -> user.getFullname())
                        .orElse("Unknown User");
                post.setPostOwnerName(postOwnerName);
            }
        });
        return posts;
    }

    @GetMapping("/learningPlan/{id}")
    LearningPlanModel getById(@PathVariable String id) {
        LearningPlanModel post = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        if (post.getPostOwnerID() != null) {
            String postOwnerName = userRepository.findById(post.getPostOwnerID())
                    .map(user -> user.getFullname())
                    .orElse("Unknown User");
            post.setPostOwnerName(postOwnerName);
        }
        return post;
    }

    @PutMapping("/learningPlan/{id}")
    LearningPlanModel update(@RequestBody LearningPlanModel newLearningPlanModel, @PathVariable String id) {
        return learningPlanRepository.findById(id)
                .map(learningPlanModel -> {
                    learningPlanModel.setTitle(newLearningPlanModel.getTitle());
                    learningPlanModel.setDescription(newLearningPlanModel.getDescription());
                    learningPlanModel.setContentURL(newLearningPlanModel.getContentURL());
                    learningPlanModel.setTags(newLearningPlanModel.getTags());
                    learningPlanModel.setImageUrl(newLearningPlanModel.getImageUrl());
                    learningPlanModel.setStartDate(newLearningPlanModel.getStartDate());
                    learningPlanModel.setEndDate(newLearningPlanModel.getEndDate());
                    learningPlanModel.setCategory(newLearningPlanModel.getCategory());

                    if (newLearningPlanModel.getPostOwnerID() != null && !newLearningPlanModel.getPostOwnerID().isEmpty()) {
                        learningPlanModel.setPostOwnerID(newLearningPlanModel.getPostOwnerID());
                        String postOwnerName = userRepository.findById(newLearningPlanModel.getPostOwnerID())
                                .map(user -> user.getFullname())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found for ID: " + newLearningPlanModel.getPostOwnerID()));
                        learningPlanModel.setPostOwnerName(postOwnerName);
                    }

                    learningPlanModel.setTemplateID(newLearningPlanModel.getTemplateID());
                    return learningPlanRepository.save(learningPlanModel);
                }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @DeleteMapping("/learningPlan/{id}")
    public void delete(@PathVariable String id) {
        learningPlanRepository.deleteById(id);
    }

    @GetMapping("/learningPlan/planImages/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage());
        }
    }
}
