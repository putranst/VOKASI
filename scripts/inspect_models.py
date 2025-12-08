import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import models

print("Attributes in models:")
for attr in dir(models):
    if "Student" in attr:
        print(attr)

if hasattr(models, 'DashboardCredential'):
    print("\nFound DashboardCredential!")
    fields = models.DashboardCredential.model_fields
    for field, info in fields.items():
        print(f"{field}: {info}")
else:
    print("\nDashboardCredential NOT found in models.")
