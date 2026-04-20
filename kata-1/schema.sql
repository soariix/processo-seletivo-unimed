-- DDL: Sistema Hospitalar (Modelagem Fila de Triagem)

-- ENUM simulado via Look-up tables (melhor flexibilidade que enum hardcoded em alguns SGDB)
CREATE TABLE urgency_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,  -- 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'
    priority_value INT NOT NULL        -- 1, 2, 3, 4
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE triage_queues (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    urgency_level_id INT NOT NULL REFERENCES urgency_levels(id),
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'WAITING', -- WAITING, IN_PROGRESS, FINISHED, CANCELLED
    computed_priority_snapshot INT DEFAULT NULL, -- Usado p/ denormalizar a criticidade no tempo (Otimização read-heavy)
    
    CONSTRAINT idx_unique_active_queue UNIQUE (patient_id, status)
);

-- Indexações otimizadas para leitura (Fila/Fifo)
CREATE INDEX idx_triage_arrival ON triage_queues(arrival_time ASC);
CREATE INDEX idx_triage_urgency ON triage_queues(urgency_level_id DESC);

-- Povoando a tabela de domínios
INSERT INTO urgency_levels (name, priority_value) VALUES 
('BAIXA', 1), ('MEDIA', 2), ('ALTA', 3), ('CRITICA', 4);
