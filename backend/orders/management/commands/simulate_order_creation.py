from django.core.management.base import BaseCommand
from simulation.order_simulator import TransactionDataSimulator

class Command(BaseCommand):
    """
    CLI Entry point: python manage.py generate_orders
    """
    help = 'Generates 3 years of organic transaction history for Orders and Payments apps.'

    def handle(self, *args, **options):
        self.stdout.write("Initializing Transaction Simulator...")
        simulator = TransactionDataSimulator()
        
        try:
            simulator.run_phase_4_transactions()
            self.stdout.write(self.style.SUCCESS('Successfully simulated all transactions.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Simulation failed: {str(e)}'))