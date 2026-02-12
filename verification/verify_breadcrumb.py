from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Go to Day 1 lesson page
    # Note: URL has base path 'Coding-For-MBA' because it's GH Pages build?
    # Actually, in preview mode, it seems to be under /Coding-For-MBA/ according to logs.
    url = "http://localhost:4173/Coding-For-MBA/#/lesson/1"
    print(f"Navigating to {url}")
    page.goto(url)

    # Wait for the breadcrumb to be visible
    page.wait_for_selector(".lesson-breadcrumb")

    # Check if breadcrumb is an ordered list (ol)
    breadcrumb = page.locator(".lesson-breadcrumb")
    tag_name = breadcrumb.evaluate("el => el.tagName.toLowerCase()")
    print(f"Breadcrumb tag: {tag_name}")
    assert tag_name == "ol", f"Expected 'ol', got '{tag_name}'"

    # Check if items are list items (li)
    items = breadcrumb.locator("li")
    count = items.count()
    print(f"Found {count} breadcrumb items")
    assert count > 0, "No breadcrumb items found"

    # Check if separators are present and hidden
    separators = breadcrumb.locator(".sep")
    sep_count = separators.count()
    print(f"Found {sep_count} separators")

    if sep_count > 0:
        hidden = separators.first.get_attribute("aria-hidden")
        print(f"Separator aria-hidden: {hidden}")
        assert hidden == "true", "Separator should be aria-hidden='true'"

    # Check for aria-current="page" on the last item
    current_page = breadcrumb.locator("[aria-current='page']")
    if current_page.count() > 0:
        print("Found aria-current='page'")
        text = current_page.inner_text()
        print(f"Current page text: {text}")
    else:
        print("aria-current='page' NOT found!")
        # This might fail if the last item is a link (unexpected)

    # Take a screenshot
    page.screenshot(path="verification_breadcrumb.png")
    print("Screenshot saved to verification_breadcrumb.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
