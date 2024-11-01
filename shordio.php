<?php
/**
 * @package Shordio
 */
/*
  Plugin Name: Shordio
  Plugin URI: https://www.shordio.com/plugin.html
  Description: WP plugin for Shordio
  Version: 1.2.6
  Author: ZCO
  Author URI: https://www.zco.com/
  License: GPLv2 or later
  Text Domain: Shordio
 */
if (!defined('ABSPATH')) {
    die;
}

if (!function_exists('add_action')) {
    echo 'Invalid action';
    exit;
}

class Shordio {

    function __construct() {
        add_action('init', array($this, 'custom_post_type'));
        add_action('init', array($this, 'callback_for_setting_up_scripts'));
        add_action('init', array($this, 'wpdocs_add_custom_shortcode'));
    }

    function callback_for_setting_up_scripts() {
        global $wp_version;

        wp_register_style('player-css', plugin_dir_url(__FILE__) . '/supportingfiles/assets/shordio_embed/css/player.css');
        wp_enqueue_style('player-css');
		wp_register_style('ad-player-css', plugin_dir_url(__FILE__) . '/supportingfiles/assets/shordio_embed/css/ad-player.css');
        wp_enqueue_style('ad-player-css');
        wp_enqueue_style('jquery.ui.theme', includes_url() . 'css//jquery-ui-dialog.css');


        wp_register_script('jquery-min-js', includes_url() . 'js/jquery/jquery.min.js', array());
        wp_register_script('bootstrap-min', plugin_dir_url(__FILE__) . 'supportingfiles/assets/shordio_embed/js/bootstrap.min.js');
        wp_enqueue_script('jquery-ui-core', includes_url() . 'js/jquery/ui/jquery-core.js', array());
        wp_enqueue_script('jquery-ui-dialog', includes_url() . 'js/jquery/ui/jdialog.js', array());

        wp_enqueue_script('vendor-d3', plugin_dir_url(__FILE__) . 'supportingfiles/assets/shordio_embed/vendor/d3/d3.v4.min.js', array());
        wp_enqueue_script('player-js', plugin_dir_url(__FILE__) . 'supportingfiles/assets/shordio_embed/js/player.js', array());
        wp_enqueue_script('validate-js', plugin_dir_url(__FILE__) . 'supportingfiles/assets/shordio_embed/js/jquery.validate.min.js', array());
        wp_enqueue_script('function-js', plugin_dir_url(__FILE__) . 'supportingfiles/assets/shordio_embed/js/function.js', array());
		
		wp_enqueue_script('gogole-add', 'https://securepubads.g.doubleclick.net/tag/js/gpt.js');
		
		wp_enqueue_script('gogole-add-mobile', 'https://securepubads.g.doubleclick.net/tag/js/gpt.js');
		
    }

    function wpdocs_add_custom_shortcode() {
        add_shortcode('shordio_player_embed', array($this, 'shordio_player_code'));
        add_shortcode('shordio_player', array($this, 'shordio_player_code_with_ad'));
    }

    function shordio_player_code($atts) {
		$current_user = wp_get_current_user();
        $arr = shortcode_atts(array('code' => '8784',), $atts);
        $ShodyUID = !empty($arr['code']) ? $arr['code'] : 8784;
        $playContent = "";
        $playContent .= '<html lang="en">
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="description" content="">
                <meta name="author" content="">
                <title>Player</title>
                <script>
                    loadPlayer("' . $ShodyUID . '");
                </script>
            </head>
            <body>
            <input type="hidden" id="load_status" value="0"/>';

        $playContent .= '<div class="main_wrapper">
                            <div class="login" style="display: none">
                                <div class="login-wrap">
                                    <div class="heading">
                                        <div class="head">Log in to follow this publisher, make playlists and save favorites.</div>
                                        <a href="#" onclick="loginmodalhide()">CLOSE</a>
                                    </div>
                                    <form id="loginform">
                                        <div class="form-wrapper">
                                            <div class="fill_controlls">
                                                <input type="email" class="emailcls" placeholder="Email" id="email" maxlength="50" name="email" />
                                                <input type="password" class="passwordcls" placeholder="Password" id="password" name="password" maxlength="20" />
                                                <button type="submit" class="submit" title="Login" value="Login"></button>
                                            </div>
                                            <div class="links-wrap">
                                                <div class="head">No account? </div>
                                                <p>
                                                    <a href="https://www.shordio.com/#signup" target="_blank">Register with Shordio</a>
                                                </p>
                                            </div>
                                        </div>
                                        <span class="errors" id="error"></span>
                                    </form>
                                </div>
                            </div>
                        <div class="player_wrapper embed-player-wrap">
                            <div class="heading">
                                <div class="header1">Listen to this article:</div>
                                <div class="header2">Powered by <a href="https://www.shordio.com/" target="_blank">Shordio</a></div>
                            </div>
                            <div class="player-inner-div">
                                <div id="customplayer-embed"></div>
                            </div>

                            <div class="clear"></div>
                        </div>
                    </div>
                   </div>
               <body>
               </html>';
        return $playContent;
    }

    function shordio_player_code_with_ad($atts) {
		$current_user = wp_get_current_user();
        $arr = shortcode_atts(array('code' => '8784',), $atts);
        $ShodyUID = !empty($arr['code']) ? $arr['code'] : 8784;
        $playContent = "";
        $playContent .= '<html lang="en">
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="description" content="">
                <meta name="author" content="">
                <title>Player</title>
                <script>
                    loadPlayer("' . $ShodyUID . '");
                </script>
            </head>
            <body>';

        $playContent .= ' <input type="hidden" name="shordy_codeid" id="shordy_codeid" value='.$atts['code'].'>
        <input type="hidden" name="user_val" id="user_val" value='.$current_user->data->ID.'>
                       
                    <div class="main_wrapper">

                    <div class="login" style="display: none">
                    <div class="login-wrap">
                        <div class="heading">
                            <div class="head">Log in to follow this publisher, make playlists and save favorites.</div>
                            <a href="#" onclick="loginmodalhide()">CLOSE</a>
                        </div>
                        <form id="loginform">
                            <div class="form-wrapper">
                                <div class="fill_controlls">
                                    <input type="email" class="emailcls" placeholder="Email" id="email" maxlength="50" name="email" />
                                    <input type="password" class="passwordcls" placeholder="Password" id="password" name="password" maxlength="20" />
                                    <button type="submit" class="submit" title="Login" value="Login"></button>
                                </div>
                                <div class="links-wrap">
                                    <div class="head">No account? </div>
                                    <p>
                                        <a href="https://www.shordio.com/#signup" target="_blank">Register with Shordio</a>
                                    </p>
                                </div>
                           </div>
                           <span class="errors" id="error"></span>
                        </form>
                    </div>
            
                    
            
                    
                </div>
                        <div class="player_wrapper embed-player-wrap">
                            <div class="heading">
                                <div class="header1">Listen to this article:</div>
                                <div class="header2">Powered by <a href="https://www.shordio.com/" target="_blank">Shordio</a></div>
                            </div>
                            <div class="player-inner-div">
                                <div id="customplayer-embed"></div>
                            </div>

                            <div class="clear"></div>
                        </div>
                    </div>
                   </div>
               <body>
               </html>';
        return $playContent;
    }

    function activate() {
        $this->custom_post_type();
        $server_name = $_SERVER['SERVER_NAME'];
        $response = wp_remote_get('https://www.shordio.com/shordy-embed/check_shordio_active', array(
            'origin' => $server_name,
            'status' => 'active'
                )
        );
        // flush
        flush_rewrite_rules();
    }

    function custom_post_type() {
        
    }

    function deactivate() {
        $server_name = $_SERVER['SERVER_NAME'];
        $response = wp_remote_get('https://www.shordio.com/shordy-embed/check_shordio_deactive', array(
            'origin' => $server_name,
            'status' => 'active'
                )
        );
        flush_rewrite_rules();
    }

    function uninstall() {
        
    }

}
if (class_exists('Shordio')) {
    $shordio = new Shordio();
}
//activate
register_activation_hook(__FILE__, array($shordio, 'activate'));
//deactivate
register_deactivation_hook(__FILE__, array($shordio, 'deactivate'));
//register_uninstall_hook(__FILE__, array($shordio, 'uninstall'));
?>