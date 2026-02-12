from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Use HashRouter format
        url = "http://localhost:5173/Coding-For-MBA/#/lesson/1"
        print(f"Navigating to {url}")
        try:
            page.goto(url)
            print("Page loaded")

            # Wait a bit
            page.wait_for_timeout(2000)

            page.screenshot(path="debug_page.png", full_page=True)
            print("Screenshot saved to debug_page.png")

            print("Waiting for .markdown-body selector")
            # reduce timeout to 5s
            page.wait_for_selector(".markdown-body", timeout=5000)

            print("Found .markdown-body")

            # Check h1
            h1_text = page.locator("h1").first.inner_text()
            print(f"Found h1: {h1_text}")

            # Check code blocks
            code_blocks = page.locator(".code-block-wrapper")
            count = code_blocks.count()
            print(f"Found {count} code blocks")

            if count > 0:
                print("Code blocks rendered successfully")
            else:
                print("No code blocks found")

            # Final verification screenshot
            page.screenshot(path="verification_markdown.png", full_page=True)
            print("Screenshot saved to verification_markdown.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_page.png", full_page=True)
            print("Screenshot saved to error_page.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
