"""Generate synthetic fraud detection data for classification exercise."""
import random

def generate_fraud_csv(n=1000, fraud_rate=0.03, seed=42):
    random.seed(seed)
    header = "amount,hour,is_international,merchant_category,velocity_24h,distance_from_home,is_fraud"
    rows = [header]
    categories = ["grocery", "gas", "online", "restaurant", "travel", "atm"]
    for _ in range(n):
        is_fraud = 1 if random.random() < fraud_rate else 0
        if is_fraud:
            amount = round(random.uniform(500, 5000), 2)
            hour = random.choice([2, 3, 4, 23, 0, 1])
            is_intl = random.choice([0, 1, 1])
            cat = random.choice(["online", "atm", "travel"])
            velocity = random.randint(5, 20)
            dist = round(random.uniform(100, 5000), 1)
        else:
            amount = round(random.uniform(5, 300), 2)
            hour = random.randint(8, 20)
            is_intl = random.choice([0, 0, 0, 1])
            cat = random.choice(categories)
            velocity = random.randint(0, 5)
            dist = round(random.uniform(0, 50), 1)
        rows.append(f"{amount},{hour},{is_intl},{cat},{velocity},{dist},{is_fraud}")
    return "\n".join(rows)

if __name__ == "__main__":
    print(generate_fraud_csv(20))
