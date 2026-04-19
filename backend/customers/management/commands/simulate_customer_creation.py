from django.core.management.base import BaseCommand
from simulation.customer_simulator import CustomerDataSimulator
from typing import Any

class Command(BaseCommand):
    """
    Django management command wrapper for the CustomerDataSimulator.
    Exposes the simulation logic to the manage.py CLI.
    """
    help = 'Generates 3 years of historical customer data using uniform temporal distribution.'

    def handle(self, *args: Any, **options: Any) -> None:
        """
        Executes the customer generation phase and handles terminal output formatting.
        """
        self.stdout.write("Starting historical customer simulation pipeline...")
        simulator = CustomerDataSimulator()

        try:
            simulator.run_customers()
            self.stdout.write(self.style.SUCCESS('Successfully generated all historical customer data.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Simulation failed abruptly: {str(e)}'))
