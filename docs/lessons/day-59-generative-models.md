Generative models synthesise data, compress signals, and enable controllable creativity. In this lesson you will:

- Contrast autoencoders, variational autoencoders, GANs, and diffusion models across objectives and sampling procedures.
- Optimise lightweight autoencoders and VAEs on synthetic data to observe reconstruction loss curves.
- Understand GAN training dynamics with simplified generator–discriminator updates and stability heuristics.
- Explore diffusion process fundamentals: forward noising, denoising score matching, and scheduler design.

Execute `python Day_59_Generative_Models/solutions.py` to run miniature training loops that log decreasing reconstruction losses and summarise practical tuning tips.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_59_Generative_Models/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_59_Generative_Models/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_59_Generative_Models/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_59_Generative_Models/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_59_Generative_Models/solutions.py)

    ```python title="solutions.py"
    """Synthetic generative modelling routines for Day 59."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict, List

    import numpy as np


    @dataclass
    class TrainingLog:
        """Container for training statistics collected per iteration."""

        losses: List[float]
        reconstructions: np.ndarray


    def generate_swiss_roll(n_samples: int = 128, random_state: int = 59) -> np.ndarray:
        """Return a 2D swiss-roll style dataset for reconstruction demos."""

        rng = np.random.default_rng(random_state)
        theta = rng.uniform(0, 3 * np.pi, size=n_samples)
        height = rng.uniform(-1.0, 1.0, size=n_samples)
        x = theta * np.cos(theta)
        y = theta * np.sin(theta)
        data = np.column_stack((x, y))
        data -= data.mean(axis=0, keepdims=True)
        data /= np.abs(data).max()
        data += 0.05 * height[:, None]
        return data.astype(np.float64)


    def _tanh(x: np.ndarray) -> np.ndarray:
        return np.tanh(x)


    def _tanh_grad(x: np.ndarray) -> np.ndarray:
        t = np.tanh(x)
        return 1.0 - t**2


    def train_autoencoder_synthetic(
        data: np.ndarray | None = None,
        hidden_dim: int = 3,
        epochs: int = 200,
        lr: float = 0.05,
        random_state: int = 59,
    ) -> TrainingLog:
        """Train a deterministic autoencoder on synthetic data."""

        X = data if data is not None else generate_swiss_roll(random_state=random_state)
        rng = np.random.default_rng(random_state)
        n_features = X.shape[1]
        W1 = rng.normal(0.0, 0.2, size=(n_features, hidden_dim))
        b1 = np.zeros(hidden_dim)
        W2 = rng.normal(0.0, 0.2, size=(hidden_dim, n_features))
        b2 = np.zeros(n_features)

        losses: List[float] = []
        for _ in range(epochs):
            z_lin = X @ W1 + b1
            z = _tanh(z_lin)
            recon = z @ W2 + b2
            diff = recon - X
            loss = float(np.mean(diff**2))
            losses.append(loss)

            grad_recon = (2.0 / X.shape[0]) * diff
            grad_W2 = z.T @ grad_recon
            grad_b2 = grad_recon.sum(axis=0)
            grad_hidden = (grad_recon @ W2.T) * _tanh_grad(z_lin)
            grad_W1 = X.T @ grad_hidden
            grad_b1 = grad_hidden.sum(axis=0)

            W2 -= lr * grad_W2
            b2 -= lr * grad_b2
            W1 -= lr * grad_W1
            b1 -= lr * grad_b1

        final_recon = _tanh(X @ W1 + b1) @ W2 + b2
        return TrainingLog(losses=losses, reconstructions=final_recon)


    def train_variational_autoencoder_synthetic(
        data: np.ndarray | None = None,
        latent_dim: int = 2,
        epochs: int = 200,
        lr: float = 0.05,
        kl_weight: float = 0.01,
        random_state: int = 59,
    ) -> TrainingLog:
        """Run a minimal VAE with reparameterisation on synthetic data."""

        X = data if data is not None else generate_swiss_roll(random_state=random_state + 1)
        rng = np.random.default_rng(random_state)
        n_features = X.shape[1]
        W_mu = rng.normal(0.0, 0.2, size=(n_features, latent_dim))
        b_mu = np.zeros(latent_dim)
        W_logvar = rng.normal(0.0, 0.2, size=(n_features, latent_dim))
        b_logvar = np.zeros(latent_dim)
        W_dec = rng.normal(0.0, 0.2, size=(latent_dim, n_features))
        b_dec = np.zeros(n_features)

        losses: List[float] = []
        for _ in range(epochs):
            mu = X @ W_mu + b_mu
            logvar = X @ W_logvar + b_logvar
            std = np.exp(0.5 * logvar)
            eps = rng.normal(0.0, 1.0, size=mu.shape)
            z = mu + eps * std
            recon = _tanh(z) @ W_dec + b_dec
            diff = recon - X
            recon_loss = np.mean(diff**2)
            kl_div = -0.5 * np.mean(1 + logvar - mu**2 - np.exp(logvar))
            loss = float(recon_loss + kl_weight * kl_div)
            losses.append(loss)

            grad_recon = (2.0 / X.shape[0]) * diff
            grad_W_dec = (_tanh(z)).T @ grad_recon
            grad_b_dec = grad_recon.sum(axis=0)
            grad_hidden = (grad_recon @ W_dec.T) * (1 - np.tanh(z) ** 2)

            grad_mu = grad_hidden + kl_weight * (mu / X.shape[0])
            grad_logvar = (
                grad_hidden * eps * std * 0.5
                + kl_weight * 0.5 * (np.exp(logvar) - 1) / X.shape[0]
            )

            grad_W_mu = X.T @ grad_mu
            grad_b_mu = grad_mu.sum(axis=0)
            grad_W_logvar = X.T @ grad_logvar
            grad_b_logvar = grad_logvar.sum(axis=0)

            W_dec -= lr * grad_W_dec
            b_dec -= lr * grad_b_dec
            W_mu -= lr * grad_W_mu
            b_mu -= lr * grad_b_mu
            W_logvar -= lr * grad_W_logvar
            b_logvar -= lr * grad_b_logvar

        final_z = X @ W_mu + b_mu
        final_recon = _tanh(final_z) @ W_dec + b_dec
        return TrainingLog(losses=losses, reconstructions=final_recon)


    def train_diffusion_denoiser(
        data: np.ndarray | None = None,
        timesteps: int = 10,
        epochs: int = 200,
        lr: float = 0.05,
        random_state: int = 59,
    ) -> TrainingLog:
        """Train a denoiser to recover clean data from a simple diffusion step."""

        X = data if data is not None else generate_swiss_roll(random_state=random_state + 2)
        rng = np.random.default_rng(random_state)
        n_features = X.shape[1]
        W = rng.normal(0.0, 0.2, size=(n_features, n_features))
        b = np.zeros(n_features)
        losses: List[float] = []

        betas = np.linspace(1e-3, 5e-2, timesteps)
        alphas = 1.0 - betas
        alpha_bar = np.cumprod(alphas)

        for _ in range(epochs):
            t = rng.integers(0, timesteps)
            noise = rng.normal(0.0, 1.0, size=X.shape)
            noisy = np.sqrt(alpha_bar[t]) * X + np.sqrt(1 - alpha_bar[t]) * noise
            pred_noise = noisy @ W + b
            diff = pred_noise - noise
            loss = float(np.mean(diff**2))
            losses.append(loss)

            grad = (2.0 / X.shape[0]) * diff
            grad_W = noisy.T @ grad
            grad_b = grad.sum(axis=0)
            W -= lr * grad_W
            b -= lr * grad_b

        final_noise = X @ W + b
        return TrainingLog(losses=losses, reconstructions=final_noise)


    def gan_training_summary(
        steps: int = 100, random_state: int = 59
    ) -> List[Dict[str, float]]:
        """Simulate GAN training metrics to illustrate convergence heuristics."""

        rng = np.random.default_rng(random_state)
        real_mean = 1.5
        gen_mean = rng.normal(-1.0, 0.1)
        log: List[Dict[str, float]] = []
        for step in range(steps):
            gen_mean += 0.03 * (real_mean - gen_mean)
            discriminator_loss = float(np.exp(-abs(real_mean - gen_mean)))
            generator_loss = float(abs(real_mean - gen_mean))
            log.append(
                {
                    "step": step,
                    "gen_loss": generator_loss,
                    "disc_loss": discriminator_loss,
                    "gen_mean": gen_mean,
                }
            )
        return log


    def summarise_generative_objectives() -> Dict[str, str]:
        """Return cheat-sheet style descriptions of key generative objectives."""

        return {
            "autoencoder": "Minimise reconstruction error with deterministic encoder/decoder.",
            "vae": "Optimise ELBO = reconstruction + KL divergence to prior.",
            "gan": "Adversarial min-max between generator and discriminator losses.",
            "diffusion": "Score matching/denoising losses across noisy timesteps.",
        }


    def run_all_demos(random_state: int = 59) -> Dict[str, object]:
        """Convenience entrypoint mirroring the CLI behaviour."""

        data = generate_swiss_roll(random_state=random_state)
        ae = train_autoencoder_synthetic(data=data, random_state=random_state)
        vae = train_variational_autoencoder_synthetic(data=data, random_state=random_state)
        diffusion = train_diffusion_denoiser(data=data, random_state=random_state)
        gan_log = gan_training_summary(random_state=random_state)
        return {
            "autoencoder": ae,
            "vae": vae,
            "diffusion": diffusion,
            "gan": gan_log,
            "objectives": summarise_generative_objectives(),
        }


    def _demo() -> None:
        stats = run_all_demos()
        print(
            f"Autoencoder start/end loss: {stats['autoencoder'].losses[0]:.4f} -> {stats['autoencoder'].losses[-1]:.4f}"
        )
        print(
            f"VAE start/end loss: {stats['vae'].losses[0]:.4f} -> {stats['vae'].losses[-1]:.4f}"
        )
        print(
            f"Diffusion start/end loss: {stats['diffusion'].losses[0]:.4f} -> {stats['diffusion'].losses[-1]:.4f}"
        )
        print(f"GAN terminal generator mean: {stats['gan'][-1]['gen_mean']:.3f}")


    if __name__ == "__main__":
        _demo()
    ```
