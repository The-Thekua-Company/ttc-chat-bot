<?php
/**
 * Plugin Name: TTC Chatbot Widget
 * Description: Embeds The Thekua Company's chat widget (customer support + recipe assistant) site-wide via the footer.
 * Version: 1.0.0
 * Author: The Thekua Company
 */

if (!defined('ABSPATH')) {
    exit;
}

function ttc_chatbot_widget_enqueue_assets() {
    $style_path = plugin_dir_path(__FILE__) . 'assets/style.css';
    $script_path = plugin_dir_path(__FILE__) . 'assets/script.js';

    wp_enqueue_style(
        'ttc-chatbot-widget-style',
        plugins_url('assets/style.css', __FILE__),
        [],
        file_exists($style_path) ? filemtime($style_path) : '1.0.0'
    );

    wp_enqueue_script(
        'ttc-chatbot-widget-script',
        plugins_url('assets/script.js', __FILE__),
        [],
        file_exists($script_path) ? filemtime($script_path) : '1.0.0',
        true
    );

    wp_localize_script('ttc-chatbot-widget-script', 'ttcChatbotData', [
        'username' => is_user_logged_in() ? wp_get_current_user()->display_name : null,
    ]);
}
add_action('wp_enqueue_scripts', 'ttc_chatbot_widget_enqueue_assets');

function ttc_chatbot_widget_render_markup() {
    ?>
    <div id="chat-widget">
      <div id="chat-teaser" class="chat-teaser hidden" role="status">
        <span>May I help you?</span>
        <button id="chat-teaser-close" type="button" aria-label="Dismiss">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <button id="chat-toggle" type="button" aria-label="Open chat">
        <svg class="chat-toggle-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      </button>

      <div id="chat-panel" class="hidden">
        <div class="chat-header">
          <div class="chat-tabs">
            <button class="tab-btn active" type="button" data-mode="chat">Support</button>
            <button class="tab-btn" type="button" data-mode="recipes">Recipe Ideas</button>
          </div>
          <button id="chat-close" type="button" aria-label="Close chat">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div id="chat-messages" class="chat-messages"></div>

        <form id="chat-form" class="chat-input-row">
          <input id="chat-input" type="text" placeholder="Type a message..." autocomplete="off" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
    <?php
}
add_action('wp_footer', 'ttc_chatbot_widget_render_markup');
