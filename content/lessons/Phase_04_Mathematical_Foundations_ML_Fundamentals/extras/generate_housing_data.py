"""Generate synthetic housing data for ML pipeline exercise."""

import random


def generate_housing_csv(n=200, seed=42):
    random.seed(seed)
    header = "sqft,bedrooms,bathrooms,age,garage,pool,neighborhood,price"
    rows = [header]
    neighborhoods = ["Downtown", "Suburbs", "Rural", "Waterfront", "Historic"]
    for _ in range(n):
        sqft = random.randint(800, 4000)
        beds = max(1, min(6, sqft // 600 + random.randint(-1, 1)))
        baths = max(1, min(4, beds - random.randint(0, 1)))
        age = random.randint(0, 80)
        garage = random.choice([0, 1, 2])
        pool = random.choice([0, 1])
        neighborhood = random.choice(neighborhoods)
        base = sqft * 150 + beds * 20000 + baths * 15000 - age * 1000
        base += garage * 10000 + pool * 25000
        if neighborhood == "Waterfront":
            base *= 1.3
        elif neighborhood == "Downtown":
            base *= 1.1
        elif neighborhood == "Rural":
            base *= 0.8
        noise = random.gauss(0, base * 0.05)
        price = max(50000, int(base + noise))
        rows.append(
            f"{sqft},{beds},{baths},{age},{garage},{pool},{neighborhood},{price}"
        )
    return "\n".join(rows)


if __name__ == "__main__":
    print(generate_housing_csv(20))
