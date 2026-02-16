from playwright.sync_api import sync_playwright

def verify_run_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to a lesson with code
        # Using lesson 1 which usually has code examples
        url = "http://localhost:5173/Coding-For-MBA/#/lesson/1"
        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for the "Run Python code (Shift+Enter)" button
        print("Waiting for run button...")
        try:
            # We are looking for button with full accessible name from aria-label
            run_button = page.get_by_role("button", name="Run Python code (Shift+Enter)").first
            run_button.wait_for(state="visible", timeout=30000)
            print("Run button found.")

            # Take a screenshot of the button specifically to verify text and icon
            # Or the whole playground
            playground = page.locator(".code-playground").first
            if playground.is_visible():
                playground.screenshot(path="verification/verification_run_button.png")
                print("Screenshot saved to verification/verification_run_button.png")
            else:
                print("Playground not found, screenshotting whole page.")
                page.screenshot(path="verification/verification_full_page.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/verification_error.png")

        browser.close()

if __name__ == "__main__":
    verify_run_button()
