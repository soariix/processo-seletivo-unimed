import enum
from dataclasses import dataclass
from datetime import datetime
from typing import List

class Urgency(enum.IntEnum):
    BAIXA = 1
    MEDIA = 2
    ALTA = 3
    CRITICA = 4

@dataclass
class Patient:
    name: str
    age: int
    urgency: Urgency
    arrival_time: datetime

    @property
    def final_urgency(self) -> Urgency:
        """
        Aplica as regras de negócio para determinar a urgência real do paciente.
        Utilizado o padrão 'Chain of adjustments' para facilitar extensões futuras.
        """
        current_urgency_value = self.urgency.value

        # Regra 4: Idosos (60+ anos) com urgência MÉDIA sobem para ALTA.
        if self.age >= 60 and self.urgency == Urgency.MEDIA:
            current_urgency_value = Urgency.ALTA.value
            
        # Regra 5: Menores de 18 anos ganham +1 nível de prioridade.
        # Note: Esta regra é mutuamente exclusiva com a Regra 4 devido à idade,
        # mas estruturamos de forma independente para manter o SRP (Single Responsibility).
        elif self.age < 18:
            current_urgency_value = min(current_urgency_value + 1, Urgency.CRITICA.value)

        return Urgency(current_urgency_value)

def order_patients(patients: List[Patient]) -> List[Patient]:
    """
    Ordena os pacientes baseando-se na urgência final (decrescente) 
    e no tempo de chegada (crescente - FIFO).
    A ordenação padrão do Python (Timsort) é estável e O(N log N).
    """
    return sorted(
        patients,
        key=lambda p: (-p.final_urgency.value, p.arrival_time)
    )
