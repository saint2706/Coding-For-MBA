from playwright.sync_api import sync_playwright, expect

def verify_accessibility(page):
    # Navigate to lesson 1 using HashRouter syntax
    print("Navigating to lesson 1...")
    page.goto("http://localhost:5173/Coding-For-MBA/#/lesson/1")

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
    if not aria_controls:
        print("❌ 'Show Solution' button missing aria-controls")
    else:
        print(f"✅ 'Show Solution' button has aria-controls: {aria_controls}")

        target = page.locator(f"#{aria_controls}")
        if target.count() > 0:
             print(f"✅ Target element #{aria_controls} exists")
             role = target.get_attribute("role")
             label = target.get_attribute("aria-label")
             if role == "region" and label == "Solution":
                 print("✅ Target element has correct role and aria-label")
             else:
                 print(f"❌ Target element has role={role} and aria-label={label}")
        else:
             print(f"❌ Target element #{aria_controls} NOT found")

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
    if not aria_controls_mc:
        print("❌ 'Check Answer' button missing aria-controls")
    else:
        print(f"✅ 'Check Answer' button has aria-controls: {aria_controls_mc}")
        target_mc = page.locator(f"#{aria_controls_mc}")
        if target_mc.count() > 0:
            print(f"✅ Target element #{aria_controls_mc} exists")
        else:
            print(f"ℹ️ Target element #{aria_controls_mc} should NOT exist yet (hidden)")

    check_btn.scroll_into_view_if_needed()
    page.screenshot(path="verification_mastery_hidden.png")

    print("Clicking Check Answer...")
    check_btn.click()
    page.wait_for_timeout(500)

    if aria_controls_mc:
        target_mc = page.locator(f"#{aria_controls_mc}")
        if target_mc.count() > 0:
             print(f"✅ Target element #{aria_controls_mc} exists (visible)")
             role = target_mc.get_attribute("role")
             label = target_mc.get_attribute("aria-label")
             if role == "region" and label == "Answer Explanation":
                 print("✅ Target element has correct role and aria-label")
             else:
                 print(f"❌ Target element has role={role} and aria-label={label}")
        else:
             print(f"❌ Target element #{aria_controls_mc} NOT found after click")

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
