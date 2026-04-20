import pytest
from datetime import datetime, timedelta
from triage import Patient, Urgency, order_patients

def test_critical_patients_always_have_priority():
    # Setup
    now = datetime.now()
    p1 = Patient("João", 30, Urgency.BAIXA, now)
    p2 = Patient("Maria", 25, Urgency.CRITICA, now + timedelta(minutes=5))
    
    # Act
    ordered = order_patients([p1, p2])
    
    # Assert (Regra 1 e 2)
    assert ordered[0].name == "Maria"
    assert ordered[1].name == "João"

def test_fifo_same_urgency():
    # Setup
    now = datetime.now()
    p1 = Patient("Ana", 30, Urgency.ALTA, now + timedelta(minutes=10))
    p2 = Patient("Carlos", 40, Urgency.ALTA, now)
    
    # Act
    ordered = order_patients([p1, p2])
    
    # Assert (Regra 3: FIFO - Quem chegou primeiro é atendido antes)
    assert ordered[0].name == "Carlos"
    assert ordered[1].name == "Ana"

def test_elderly_medium_upgrades_to_high():
    # Setup
    now = datetime.now()
    p1 = Patient("Senhor José", 65, Urgency.MEDIA, now)
    p2 = Patient("Jovem Pedro", 30, Urgency.MEDIA, now - timedelta(minutes=5))
    
    # Act
    ordered = order_patients([p1, p2])
    
    # Assert (Regra 4: Idoso sobe para ALTA, ultrapassando um MEDIA mais antigo)
    assert ordered[0].name == "Senhor José"
    assert ordered[1].name == "Jovem Pedro"

def test_under_18_medium_upgrades_to_high():
    # Setup: Regra 5 para casos de borda
    now = datetime.now()
    p1 = Patient("Adolescente", 15, Urgency.MEDIA, now) 
    p2 = Patient("Adulto Alta", 30, Urgency.ALTA, now - timedelta(minutes=5))
    
    # Act
    ordered = order_patients([p1, p2])
    
    # Assert: Adolescente vai de MEDIA para ALTA (+1 nível). 
    # Sendo ambos ALTA agora, o FIFO decide. O adulto chegou 5 mins antes.
    assert ordered[0].name == "Adulto Alta"
    assert ordered[1].name == "Adolescente"

def test_under_18_critical_stays_critical():
    # Setup: Regra 5 (borda: já no máximo)
    now = datetime.now()
    p1 = Patient("Bebê", 2, Urgency.CRITICA, now)
    
    # Act
    ordered = order_patients([p1])
    
    # Assert: +1 não pode ultrapassar Crítica
    assert ordered[0].final_urgency == Urgency.CRITICA
