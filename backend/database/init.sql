-- 创建活动表
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL COMMENT '活动名称',
    description TEXT COMMENT '活动描述',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    location VARCHAR(200) NOT NULL COMMENT '活动地点',
    max_participants INT DEFAULT NULL COMMENT '最大参与人数',
    club_id INT NOT NULL COMMENT '社团ID',
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft' COMMENT '活动状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建活动报名表
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL COMMENT '活动ID',
    user_id INT NOT NULL COMMENT '用户ID',
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT '报名状态',
    check_in_time DATETIME DEFAULT NULL COMMENT '签到时间',
    check_out_time DATETIME DEFAULT NULL COMMENT '签退时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    UNIQUE KEY unique_registration (activity_id, user_id)
);

-- 创建活动评价表
CREATE TABLE activity_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL COMMENT '活动ID',
    user_id INT NOT NULL COMMENT '用户ID',
    rating INT NOT NULL COMMENT '评分（1-5）',
    comment TEXT COMMENT '评价内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    UNIQUE KEY unique_feedback (activity_id, user_id)
); 