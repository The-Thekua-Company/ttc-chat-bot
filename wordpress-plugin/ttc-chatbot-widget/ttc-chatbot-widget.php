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
    wp_enqueue_style(
        'ttc-chatbot-widget-style',
        plugins_url('assets/style.css', __FILE__),
        [],
        '1.0.0'
    );

    wp_enqueue_script(
        'ttc-chatbot-widget-script',
        plugins_url('assets/script.js', __FILE__),
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'ttc_chatbot_widget_enqueue_assets');

function ttc_chatbot_widget_render_markup() {
    ?>
    <div id="chat-widget">
      <button id="chat-toggle" aria-label="Open chat">💬</button>

      <div id="chat-panel" class="hidden">
        <div class="chat-header">
          <div class="chat-tabs">
            <button class="tab-btn active" data-mode="chat">Support</button>
            <button class="tab-btn" data-mode="recipes">Recipe Ideas</button>
          </div>
          <button id="chat-close" aria-label="Close chat">✕</button>
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
