CREATE DATABASE IF NOT EXISTS `woca` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `woca`;

CREATE TABLE IF NOT EXISTS `users` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `openid`         VARCHAR(255) NOT NULL UNIQUE,
  `unionid`        VARCHAR(255) NULL,
  `nickname`       VARCHAR(255) NULL,
  `avatar`         VARCHAR(255) NULL,
  `remain_seconds` INT          NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `packages` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255)   NOT NULL,
  `price`       DECIMAL(10, 2) NOT NULL,
  `seconds`     INT            NOT NULL,
  `is_popular`  TINYINT(1)     NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
  `description` VARCHAR(255)   NULL,
  `created_at`  DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`  DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tasks` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_id`    INT          NOT NULL,
  `file_name`  VARCHAR(255) NOT NULL,
  `video_url`  TEXT         NOT NULL,
  `file_id`    VARCHAR(255) NULL,
  `result_url` TEXT         NULL,
  `status`     ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  `duration`   FLOAT        NULL,
  `width`      INT          NULL,
  `height`     INT          NULL,
  `error_msg`  VARCHAR(255) NULL,
  `x1`         INT          NOT NULL DEFAULT 0,
  `y1`         INT          NOT NULL DEFAULT 0,
  `x2`         INT          NOT NULL DEFAULT 0,
  `y2`         INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id`            INT            NOT NULL AUTO_INCREMENT,
  `user_id`       INT            NOT NULL,
  `package_id`    INT            NOT NULL,
  `amount`        DECIMAL(10, 2) NOT NULL,
  `status`        ENUM('pending','paid','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `pay_channel`   ENUM('wechat','alipay') NULL,
  `pay_trade_no`  VARCHAR(255)   NULL,
  `prepay_id`     VARCHAR(255)   NULL,
  `paid_at`       DATETIME       NULL,
  `out_trade_no`  VARCHAR(255)   NOT NULL UNIQUE,
  `created_at`    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`),
  CONSTRAINT `fk_orders_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始套餐数据
INSERT IGNORE INTO `packages` (id, name, price, seconds, is_popular, is_active, description, created_at, updated_at) VALUES
(1, '体验包',  9.90,   600,   0, 1, '10分钟时长，适合尝鲜',       NOW(), NOW()),
(2, '标准包',  29.90,  3600,  1, 1, '1小时时长，性价比之选',       NOW(), NOW()),
(3, '专业包',  99.00,  18000, 0, 1, '5小时时长，专业用户推荐',     NOW(), NOW()),
(4, '旗舰包',  199.00, 43200, 0, 1, '12小时时长，超值优惠',        NOW(), NOW());
