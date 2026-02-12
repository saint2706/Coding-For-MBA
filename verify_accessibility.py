from playwright.sync_api import sync_playwright, expect
import os

def verify_accessibility(page):
    # Use configurable base URL (default to vite preview port 4173)
    # Note: Changed from dev server port (5173) to align with existing verification scripts
    base_url = os.environ.get("BASE_URL", "http://localhost:4173")
    print(f"Navigating to lesson 1 at {base_url}...")
    page.goto(f"{base_url}/Coding-For-MBA/#/lesson/1")

    # Wait for content to load
    page.wait_for_load_state("networkidle")

    # Wait for the exercise widget to appear
    print("Looking for Exercise 1...")
    exercise_header = page.get_by_text("Exercise 1: The Company Introduction")
    expect(exercise_header).to_be_visible()

    # Locate the toggle button for solution
    toggle_btn = page.get_by_role("button", name="Show Solution").first

    # Check if it has aria-controls attribute
    aria_controls = toggle_btn.get_attribute("aria-controls")
    assert aria_controls, "❌ 'Show Solution' button missing aria-controls"
    print(f"✅ 'Show Solution' button has aria-controls: {aria_controls}")

    # Use attribute selector to handle special characters in useId() generated IDs
    target = page.locator(f'[id="{aria_controls}"]')
    assert target.count() > 0, f"❌ Target element with id='{aria_controls}' NOT found"
    print(f"✅ Target element with id='{aria_controls}' exists")
    
    role = target.get_attribute("role")
    label = target.get_attribute("aria-label")
    assert role == "region", f"❌ Target element has role={role}, expected 'region'"
    assert label == "Solution", f"❌ Target element has aria-label={label}, expected 'Solution'"
    print("✅ Target element has correct role and aria-label")

    toggle_btn.scroll_into_view_if_needed()
    page.screenshot(path="verification_exercise_hidden.png")

    print("Clicking Show Solution...")
    toggle_btn.click()
    page.wait_for_timeout(500)
    page.screenshot(path="verification_exercise_visible.png")

    # Check Mastery Check
    print("Looking for Question 1...")
    mastery_header = page.get_by_text("Question 1: Basic Syntax")
    expect(mastery_header).to_be_visible()

    check_btn = page.get_by_role("button", name="Check Answer").first

    aria_controls_mc = check_btn.get_attribute("aria-controls")
    # aria-controls should NOT be present initially (before click)
    assert aria_controls_mc is None, f"❌ 'Check Answer' button should not have aria-controls before reveal, but has: {aria_controls_mc}"
    print("✅ 'Check Answer' button correctly has no aria-controls initially")

    check_btn.scroll_into_view_if_needed()
    page.screenshot(path="verification_mastery_hidden.png")

    print("Clicking Check Answer...")
    check_btn.click()
    page.wait_for_timeout(500)

    # Re-query the button to get updated attributes after React re-renders
    check_btn = page.get_by_role("button", name="Hide Answer").first
    
    # After click, aria-controls should be present
    aria_controls_mc = check_btn.get_attribute("aria-controls")
    assert aria_controls_mc, "❌ 'Check Answer' button missing aria-controls after reveal"
    print(f"✅ 'Check Answer' button has aria-controls after reveal: {aria_controls_mc}")
    
    # Use attribute selector to handle special characters in useId() generated IDs
    target_mc = page.locator(f'[id="{aria_controls_mc}"]')
    assert target_mc.count() > 0, f"❌ Target element with id='{aria_controls_mc}' NOT found after click"
    print(f"✅ Target element with id='{aria_controls_mc}' exists (visible)")
    
    role = target_mc.get_attribute("role")
    label = target_mc.get_attribute("aria-label")
    assert role == "region", f"❌ Target element has role={role}, expected 'region'"
    assert label == "Answer Explanation", f"❌ Target element has aria-label={label}, expected 'Answer Explanation'"
    print("✅ Target element has correct role and aria-label")

    page.screenshot(path="verification_mastery_visible.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_accessibility(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
            raise e
        finally:
            browser.close()
