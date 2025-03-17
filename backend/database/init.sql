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

-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
    total_points INT DEFAULT 0 COMMENT '总积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_username (username),
    UNIQUE KEY unique_email (email)
);

-- 创建积分规则表
CREATE TABLE point_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type ENUM('earn', 'consume') NOT NULL COMMENT '规则类型: 获取/消耗',
    action_type VARCHAR(50) NOT NULL COMMENT '行为类型: activity_participation, new_user_invitation, etc',
    points INT NOT NULL COMMENT '积分值',
    exchange_ratio DECIMAL(10,2) DEFAULT NULL COMMENT '兑换比例',
    validity_days INT DEFAULT NULL COMMENT '有效期(天)',
    description TEXT COMMENT '规则描述',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL COMMENT '创建人ID',
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 创建积分记录表
CREATE TABLE point_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    rule_id INT NOT NULL COMMENT '积分规则ID',
    points INT NOT NULL COMMENT '积分值',
    transaction_type ENUM('earn', 'consume') NOT NULL COMMENT '交易类型: 获取/消耗',
    reference_id INT DEFAULT NULL COMMENT '关联ID(如活动ID)',
    reference_type VARCHAR(50) DEFAULT NULL COMMENT '关联类型(如activity)',
    description TEXT COMMENT '交易描述',
    operator_id INT DEFAULT NULL COMMENT '操作人ID',
    expire_at DATETIME DEFAULT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (rule_id) REFERENCES point_rules(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
);

-- 创建用户邀请记录表
CREATE TABLE user_invitations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inviter_id INT NOT NULL COMMENT '邀请人ID',
    invitee_id INT NOT NULL COMMENT '被邀请人ID',
    status ENUM('pending', 'completed') DEFAULT 'pending' COMMENT '邀请状态',
    points_awarded BOOLEAN DEFAULT FALSE COMMENT '是否已发放积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
    FOREIGN KEY (inviter_id) REFERENCES users(id),
    FOREIGN KEY (invitee_id) REFERENCES users(id)
);

-- 为了关联活动表中的club_id，增加社团表
CREATE TABLE clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '社团名称',
    description TEXT COMMENT '社团描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 添加外键关联
ALTER TABLE activities ADD FOREIGN KEY (club_id) REFERENCES clubs(id);
ALTER TABLE registrations ADD FOREIGN KEY (user_id) REFERENCES users(id); 