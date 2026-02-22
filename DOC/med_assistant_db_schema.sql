-- Smart Med Assistant Database Schema
-- PostgreSQL 14+

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'relative', 'doctor', 'admin')),
    invite_code VARCHAR(8) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица профилей
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    region_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица связей (пациент-родственник)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relative_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, relative_id)
);

-- Справочник диагнозов
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Диагнозы пациентов
CREATE TABLE patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    diagnosis_id UUID REFERENCES diagnoses(id),
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    diagnosed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Справочник симптомов
CREATE TABLE symptom_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    is_auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Связь диагноз-симптом
CREATE TABLE diagnosis_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptom_catalog(id) ON DELETE CASCADE,
    is_critical BOOLEAN DEFAULT false,
    UNIQUE(diagnosis_id, symptom_id)
);

-- Таблица лекарств
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    instruction TEXT,
    photo_url VARCHAR(500),
    scheduled_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Логи приема лекарств (главная таблица)
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    med_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('taken', 'missed', 'pending')),
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Журнал состояния здоровья
CREATE TABLE health_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    free_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Логи симптомов
CREATE TABLE symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES health_journal(id) ON DELETE CASCADE,
    raw_text TEXT,
    processed_tags JSONB,
    detected_symptoms UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Метеоданные (для корреляции)
CREATE TABLE meteo_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(10) NOT NULL,
    log_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    air_pressure DECIMAL(6,2),
    humidity INTEGER,
    temperature DECIMAL(4,1),
    kp_index INTEGER CHECK (kp_index BETWEEN 0 AND 9),
    weather_condition VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Шаблоны промптов для LLM
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    persona_block TEXT,
    context_block TEXT,
    task_block TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- История версий промптов
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_medications_patient ON medications(patient_id, is_active);
CREATE INDEX idx_logs_med_scheduled ON medication_logs(med_id, scheduled_at);
CREATE INDEX idx_logs_status ON medication_logs(status, scheduled_at);
CREATE INDEX idx_health_journal_patient_date ON health_journal(patient_id, log_date);
CREATE INDEX idx_meteo_region_timestamp ON meteo_logs(region_code, log_timestamp);
CREATE INDEX idx_connections_patient ON connections(patient_id, status);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического сброса флагов в полночь
CREATE OR REPLACE FUNCTION reset_daily_medication_flags()
RETURNS void AS $$
BEGIN
    UPDATE medication_logs
    SET status = 'pending'
    WHERE DATE(scheduled_at) < CURRENT_DATE
    AND status = 'taken';
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Основная таблица пользователей системы';
COMMENT ON TABLE medications IS 'Расписание приема лекарств';
COMMENT ON TABLE medication_logs IS 'История всех приемов лекарств (главная аналитическая таблица)';
COMMENT ON TABLE meteo_logs IS 'Метеоданные для корреляционного анализа';
COMMENT ON TABLE prompt_templates IS 'Настраиваемые шаблоны для LLM-анализа';