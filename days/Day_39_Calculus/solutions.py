import numpy as np
import sympy as sp


def symbolic_derivative():
    """Return a polynomial and its derivative."""

    x_symbol = sp.Symbol("x")
    polynomial = x_symbol**3 - 2 * x_symbol**2 + 5
    derivative = sp.diff(polynomial, x_symbol)
    return polynomial, derivative


def numerical_gradient(x_val=2.0, y_val=3.0, step=1e-6):
    """Return the numerical gradient of f(x, y) = x^2 * y + y^3 at a point."""

    def f(x, y):
        return x**2 * y + y**3

    df_dx = (f(x_val + step, y_val) - f(x_val, y_val)) / step
    df_dy = (f(x_val, y_val + step) - f(x_val, y_val)) / step
    return np.array([df_dx, df_dy])


def chain_rule_derivative():
    """Return the composite function y(x) and its derivative using the chain rule."""

    x_symbol = sp.Symbol("x")
    u_expression = 2 * x_symbol + 1
    y_expression = (u_expression) ** 2
    derivative = sp.diff(y_expression, x_symbol)
    return sp.expand(y_expression), sp.expand(derivative)


def main():
    polynomial, derivative = symbolic_derivative()
    print("--- Symbolic Differentiation ---")
    print(f"Original function f(x): {polynomial}")
    print(f"Derivative f'(x): {derivative}")
    print("-" * 30)

    gradient = numerical_gradient()
    print("\n--- Numerical Gradient ---")
    print("Function f(x, y) = x^2 * y + y^3")
    print(f"Numerical gradient at (2, 3): {gradient.tolist()}")
    print("Analytical gradient: [12, 31]")
    print("-" * 30)

    composite, composite_derivative = chain_rule_derivative()
    print("\n--- Chain Rule Application ---")
    print(f"Composite function y(x): {composite}")
    print(f"Derivative dy/dx: {composite_derivative}")
    print("-" * 30)


if __name__ == "__main__":
    main()
