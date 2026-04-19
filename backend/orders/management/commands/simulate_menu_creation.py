from typing import Any
from django.core.management.base import BaseCommand

# Update the import path to match the directory where inventory_simulator.py is saved
from simulation.menuitems_simulator import InventoryDataSimulator

class Command(BaseCommand):
    """
    Django CLI wrapper for generating baseline inventory data.
    Usage: python manage.py generate_inventory
    """
    help = 'Generates 70 baseline menu items pinned to the start of the historical timeline.'

    def handle(self, *args: Any, **options: Any) -> None:
        """
        Executes the generation process and manages standard output logging.
        """
        self.stdout.write("Initializing Inventory Data Simulator...")
        simulator = InventoryDataSimulator()
        
        try:
            simulator.generate_menu_items()
            self.stdout.write(self.style.SUCCESS('Successfully simulated all requested inventory data.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Simulation halted due to exception: {str(e)}'))
