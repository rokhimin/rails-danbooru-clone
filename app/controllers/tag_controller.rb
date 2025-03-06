require 'rss'
require 'open-uri'

class TagController < ApplicationController
  def fetch
    tag = params[:tag]
    @page = (params[:page] || 1).to_i
    @page = 1 if @page < 1
    @per_page = 20
    
    url = "https://danbooru.donmai.us/posts.atom?tags=#{tag}&page=#{@page}"

    begin
      rss_content = URI.open(url).read
      feed = RSS::Parser.parse(rss_content, false)

      @entries = feed.entries.map do |entry|
        original_title = entry.title.content
        formatted_title = original_title.gsub(/\s+/, '_') 

        image_url = entry.content.content.match(/src="([^"]+)"/)[1] 

        full_image_url = image_url.sub(
          %r{/\d+x\d+/([^/]+)/([^/]+)/([^/]+\.jpg)}, 
          "/original/\\1/\\2/__#{formatted_title}__\\3"
        )

        post_id = entry.link.href.split('/').last
        
        {
          title: original_title,
          link: post_id, 
          image: image_url, 
          full_image: full_image_url 
        }
      end
      
      @has_next_page = @entries.size >= @per_page
      
    rescue StandardError => e
      @error = "Failed : #{e.message}"
    end

    respond_to do |format|
      format.html
      format.json { render json: @entries || { error: @error } }
    end
  end
  
  def show_image
    @tag = params[:tag]
    post_id = params[:id]
    
    url = "https://danbooru.donmai.us/posts.atom?tags=#{@tag}"
    
    begin
      @entry = find_entry_in_feed(url, post_id)
      
      page = 2
      while @entry.nil? && page <= 5
        next_url = "#{url}&page=#{page}"
        @entry = find_entry_in_feed(next_url, post_id)
        page += 1
      end
      
      if @entry.nil?
        @title = "Image Detail"
        @full_image_url = "/#{@tag}&id=#{post_id}" 
        @original_post_url = "https://danbooru.donmai.us/posts/#{post_id}"
      end
      
    rescue StandardError => e
      @error = "Failed to load image: #{e.message}"
    end
  end
  
  private
  
  def find_entry_in_feed(url, post_id)
    rss_content = URI.open(url).read
    feed = RSS::Parser.parse(rss_content, false)
    
    matching_entry = feed.entries.find do |entry|
      entry.link.href.split('/').last == post_id
    end
    
    if matching_entry
      original_title = matching_entry.title.content
      formatted_title = original_title.gsub(/\s+/, '_')
      
      image_url = matching_entry.content.content.match(/src="([^"]+)"/)[1]
      
      full_image_url = image_url.sub(
        %r{/\d+x\d+/([^/]+)/([^/]+)/([^/]+\.jpg)}, 
        "/original/\\1/\\2/__#{formatted_title}__\\3"
      )
      
      sample_image_url = image_url.sub(
        %r{/\d+x\d+/([^/]+)/([^/]+)/([^/]+\.jpg)}, 
        "/sample/\\1/\\2/__#{formatted_title}__sample-\\3"
      )
      
      {
        title: original_title,
        image: image_url,
        sample_image: sample_image_url,  
        full_image: full_image_url,
        link: matching_entry.link.href,
        post_id: post_id
      }
    else
      nil
    end
  end

end