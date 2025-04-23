package com.socialapp.Zircuit.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity


public class PostModel {

    @Id
    @GeneratedValue
    private Long post_id;
    private String user_id;
    private String title;
    private String content;
    private List<PostMediaModel> mediaList;

    public PostModel(){

    }

    //constructor
    public PostModel(Long post_id, String user_id, String title, String content, List<PostMediaModel> mediaList) {
        this.post_id = post_id;
        this.user_id = user_id;
        this.title = title;
        this.content = content;
        this.mediaList = mediaList;
    }

    public Long getPost_id() {
        return post_id;
    }

    public String getUser_id() {
        return user_id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public List<PostMediaModel> getMediaList() {
        return mediaList;
    }

     //setters
    public void setPost_id(Long post_id) {
        this.post_id = post_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setMediaList(List<PostMediaModel> mediaList) {
        this.mediaList = mediaList;
    }

   
    

    

    

    



}
