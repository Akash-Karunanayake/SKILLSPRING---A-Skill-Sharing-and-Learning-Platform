package com.socialapp.Zircuit.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.socialapp.Zircuit.model.postModel;
import com.socialapp.Zircuit.repository.postRepo;

@RestController
@CrossOrigin("http://localhost:3000")

public class postController {
@Autowired
private postRepo PostRepo;

@PostMapping("/post")
public postModel newpostModel(@RequestBody postModel newpostModel){
    return PostRepo.save(newpostModel);
}

@PostMapping("/post/post_image")
}

