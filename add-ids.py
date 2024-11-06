import re
from bs4 import BeautifulSoup

# Read the HTML content from the file
with open("presentations-publications.html", "r", encoding="utf-8") as file:
    html_content = file.read()

# Parse the HTML content
soup = BeautifulSoup(html_content, "html.parser")

# Initialize a dictionary to keep track of years for each section
years_seen = {}

# Define the section classes to process
sections_to_process = ["publications", "presentations"]

for section_class in sections_to_process:
    # Find all divs that have the section_class in their class list
    sections = soup.find_all("div", class_=lambda x: x and section_class in x.split())
    print(f"Found {len(sections)} sections for class '{section_class}'")
    for section in sections:
        years_seen[section_class] = set()

        # Find all card divs within this section
        cards = section.find_all("div", class_="card", recursive=False)
        print(f"Processing {len(cards)} cards in section '{section_class}'")
        for card in cards:
            # Find the h3 tag inside the card
            h3 = card.find("h3")
            if h3:
                print(f"Found h3 tag: {h3.text}")
                # Updated regex pattern
                match = re.search(r"\((?:[^\d]*\s)?(\d{4})\)", h3.text)
                if match:
                    year = match.group(1)
                    if year not in years_seen[section_class]:
                        years_seen[section_class].add(year)
                        # Add ID to the card
                        card["id"] = f"{section_class}-{year}"
                        print(f"Added ID '{card['id']}' to card")
                else:
                    print(f"No year found in h3 text: {h3.text}")
            else:
                print("No h3 tag found in card")

# Write the modified HTML back to a file
with open("output.html", "w", encoding="utf-8") as file:
    file.write(str(soup))
