from typing import Any
from django.core.management.base import BaseCommand

# Adjust the import path to match where you saved table_simulator.py
from simulation.dining_simulator import TableDataSimulator

class Command(BaseCommand):
    """
    Django CLI wrapper for generating dining table configuration.
    Usage: python manage.py generate_tables
    """
    help = 'Generates 10 baseline dining tables pinned to the start of the historical timeline.'

    def handle(self, *args: Any, **options: Any) -> None:
        self.stdout.write("Initializing Dining Table Simulator...")
        simulator = TableDataSimulator()
        
        try:
            simulator.generate_tables()
            self.stdout.write(self.style.SUCCESS('Successfully simulated all dining tables.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Simulation halted: {str(e)}'))