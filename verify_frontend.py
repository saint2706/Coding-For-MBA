from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Visit Home
        print("Navigating to Home...")
        page.goto("http://localhost:5173/Coding-For-MBA/")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="verification_home.png")

        # 2. Visit Exercises
        print("Navigating to Exercises...")
        page.goto("http://localhost:5173/Coding-For-MBA/exercises")
        page.wait_for_load_state("networkidle")
        # Wait for cards to animate in
        time.sleep(1)
        page.screenshot(path="verification_exercises.png")

        # 3. Visit a Lesson (Day 1)
        print("Navigating to Lesson 1...")
        page.goto("http://localhost:5173/Coding-For-MBA/lesson/1")
        page.wait_for_load_state("networkidle")

        # Toggle Sidebar Phase 1 (should be open by default if we are on Day 1?)
        # Sidebar logic: derivedOpenPhase is set.
        # Let's check if Sidebar renders correctly.
        page.screenshot(path="verification_lesson.png")

        # Check CodePlayground (if any on Day 1)
        # Day 1 usually has some code blocks.
        # Let's type in one if found.
        editors = page.locator(".code-playground__textarea")
        if editors.count() > 0:
            print("Found CodePlayground, typing...")
            editor = editors.first
            editor.fill("print('Hello Bolt')")
            time.sleep(0.5)
            page.screenshot(path="verification_codeplayground.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_frontend()
