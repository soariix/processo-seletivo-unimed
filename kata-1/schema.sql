CREATE TABLE urgency_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,  
    priority_value INT NOT NULL        
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
    status VARCHAR(20) DEFAULT 'WAITING', 
    computed_priority_snapshot INT DEFAULT NULL, 
    
    CONSTRAINT idx_unique_active_queue UNIQUE (patient_id, status)
);

CREATE INDEX idx_triage_arrival ON triage_queues(arrival_time ASC);
CREATE INDEX idx_triage_urgency ON triage_queues(urgency_level_id DESC);

INSERT INTO urgency_levels (name, priority_value) VALUES 
('BAIXA', 1), ('MEDIA', 2), ('ALTA', 3), ('CRITICA', 4);
