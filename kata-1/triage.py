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
        current_urgency_value = self.urgency.value

        if self.age >= 60 and self.urgency == Urgency.MEDIA:
            current_urgency_value = Urgency.ALTA.value
            
        elif self.age < 18:
            current_urgency_value = min(current_urgency_value + 1, Urgency.CRITICA.value)

        return Urgency(current_urgency_value)

def order_patients(patients: List[Patient]) -> List[Patient]:
    return sorted(
        patients,
        key=lambda p: (-p.final_urgency.value, p.arrival_time)
    )
