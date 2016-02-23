<?php // Copy this file to web/
/**
 * MySQL settings - You can get this info from your web host
 */
define('DB_NAME', 'database_name_here');
define('DB_USER', 'username_here');
define('DB_PASSWORD', 'password_here');
define('DB_HOST', 'localhost');

/**
 * WordPress Database Table prefix.
 */
$table_prefix  = 'wp_';

/**
 * Local URL settings
 */
define('WP_HOME', $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME']);
define('WP_SITEURL', $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['SERVER_NAME'] . '/wordpress/');
define('FORCE_SSL', false);

/**
 * Moving wp-content into the web root
 */
define('WP_CONTENT_DIR', dirname(__FILE__) . '/wp-content');
define('WP_CONTENT_URL', WP_HOME . '/wp-content' );

/**
 * Set the default theme
 */
define('WP_DEFAULT_THEME', 'base');

/**
 * Debug options
 */
define('SAVEQUERIES', false); // (De)activates the saving of database queries in an array ($wpdb->queries).
define('SCRIPT_DEBUG', false); // (De)activates the loading of compressed Javascript and CSS files.
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', true);
define('WP_DEBUG_LOG', false);
define('WP_MEMORY_LIMIT', '32M'); // Increase for complex sites

/**
 * Regenerate with {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 */
define('AUTH_KEY',         'm{=Ay=84@`Irk QcltSf`dnhn+WsueNuVI3sK*;|#3vc<]Nf5}w]+p,M0~(|5?C9');
define('SECURE_AUTH_KEY',  '(aNa;hW/m!154Iv `Gm}O|*| K|FFxe=,-ve@yUQ~Rw_tIEinf*o?@+Y[Y|8J4A|');
define('LOGGED_IN_KEY',    'x:=-#.FH7P*c`93, UAAQi-33:$g#s@]Sxp8u]=+Jvdl!d/S5bsN8|xyS*I:zdC}');
define('NONCE_KEY',        '@W3xB1ObmwU/+vpKUlH {!;Et?R79BtqIC|6YOR=D7S]`?,QS7=THFSboV/*,A<F');
define('AUTH_SALT',        'iEn/E|?O[K4J|! L`jPP&Kb^OVaVw7f~+;&BB*H$89lGV?QK8`[d-FIs@-O&~E|R');
define('SECURE_AUTH_SALT', '5.t+&*2TYoH]mE[rf4PNOAgS19y2)Irq8qdn}T~+qN_H>n(sgZHU-)0#HFv.WrW1');
define('LOGGED_IN_SALT',   '|+GcE<<|e*<3h$eR-?njqUE}l{;Njt13?vd*2!5>NVJs[1f-HG}%L]68}mQ= EXD');
define('NONCE_SALT',       '<M0&=`wolay_BUItC,Z-8#SUWq;>5x*m!oU3$dX(r?Zq=H%+]V*yAfLn,1N*;RV>');
