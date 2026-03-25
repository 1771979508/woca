CREATE DATABASE IF NOT EXISTS `woca` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `woca`;

-- 初始套餐数据
INSERT IGNORE INTO `packages` (id, name, price, seconds, is_popular, is_active, description, created_at, updated_at) VALUES
(1, '体验包', 9.90, 600, 0, 1, '10分钟时长，适合尝鲜', NOW(), NOW()),
(2, '标准包', 29.90, 3600, 1, 1, '1小时时长，性价比之选', NOW(), NOW()),
(3, '专业包', 99.00, 18000, 0, 1, '5小时时长，专业用户推荐', NOW(), NOW()),
(4, '旗舰包', 199.00, 43200, 0, 1, '12小时时长，超值优惠', NOW(), NOW());
