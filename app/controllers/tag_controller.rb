require 'net/http'
require 'json'
require 'uri'
require 'openssl'

class TagController < ApplicationController

  def fetch
    tag = params[:tag]
    @page = (params[:page] || 1).to_i
    @page = 1 if @page < 1
    @per_page = 20
    
    # Menggunakan proxy untuk menghindari masalah CORS/SSL
    proxy_url = "https://api.allorigins.win/raw?url="
    danbooru_url = "https://danbooru.donmai.us/posts.json?tags=#{URI.encode_www_form_component(tag)}&page=#{@page}&limit=#{@per_page}"
    url = proxy_url + danbooru_url
    
    begin
      # Metode yang lebih aman untuk melakukan HTTP request
      uri = URI(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true if uri.scheme == 'https'
      
      # Konfigurasi SSL yang lebih toleran
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      http.open_timeout = 15
      http.read_timeout = 30
      
      request = Net::HTTP::Get.new(uri.request_uri)
      response = http.request(request)
      
      if response.is_a?(Net::HTTPSuccess)
        posts = JSON.parse(response.body)
        
        @entries = posts.map do |post|
          original_title = post['tag_string_character'].present? ? post['tag_string_character'] : post['id'].to_s
          formatted_title = original_title.gsub(/\s+/, '_')
          
          # Mendapatkan URL gambar dari respons JSON
          image_url = post['preview_file_url']
          sample_image_url = post['large_file_url']
          full_image_url = post['file_url']
          post_id = post['id']
          
          {
            title: original_title,
            link: post_id, 
            image: image_url, 
            sample_image: sample_image_url,
            full_image: full_image_url
          }
        end
        
        @has_next_page = posts.size >= @per_page
      else
        @error = "API request failed with status: #{response.code} - #{response.message}"
      end
      
    rescue StandardError => e
      @error = "Failed: #{e.message}"
      Rails.logger.error("API Error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
    end

    respond_to do |format|
      format.html
      format.json { render json: @entries || { error: @error } }
    end
  end
  
  def show_image
    @tag = params[:tag]
    post_id = params[:id]
    
    # Menggunakan proxy untuk menghindari masalah CORS/SSL
    proxy_url = "https://api.allorigins.win/raw?url="
    danbooru_url = "https://danbooru.donmai.us/posts/#{post_id}.json"
    url = proxy_url + danbooru_url
    
    begin
      uri = URI(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true if uri.scheme == 'https'
      
      # Konfigurasi SSL yang lebih toleran
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      http.open_timeout = 15
      http.read_timeout = 30
      
      request = Net::HTTP::Get.new(uri.request_uri)
      response = http.request(request)
      
      if response.is_a?(Net::HTTPSuccess)
        post = JSON.parse(response.body)
        
        original_title = post['tag_string_character'].present? ? post['tag_string_character'] : post['id'].to_s
        formatted_title = original_title.gsub(/\s+/, '_')
        
        @entry = {
          title: original_title,
          image: post['preview_file_url'],
          sample_image: post['large_file_url'],
          full_image: post['file_url'],
          link: "https://danbooru.donmai.us/posts/#{post_id}",
          post_id: post_id,
          tag_general: post['tag_string_general'],
          artist: post['tag_string_artist'],
          source: post['source']
        }
      else
        @title = "Image Detail"
        @full_image_url = "/#{@tag}&id=#{post_id}" 
        @original_post_url = "https://danbooru.donmai.us/posts/#{post_id}"
        @error = "Couldn't fetch image details (HTTP #{response.code})"
      end
      
    rescue StandardError => e
      @error = "Failed to load image: #{e.message}"
      Rails.logger.error("Image Detail Error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
    end
  end
  
  # Metode pembantu untuk menangani requests dengan lebih aman
  private
  
  def safe_http_request(url)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true if uri.scheme == 'https'
    
    # Konfigurasi SSL yang lebih toleran
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    http.open_timeout = 15
    http.read_timeout = 30
    
    request = Net::HTTP::Get.new(uri.request_uri)
    http.request(request)
  end
end