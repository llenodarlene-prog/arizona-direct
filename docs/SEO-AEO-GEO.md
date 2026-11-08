# SEO, AEO and GEO publishing rules

## Internal linking
Every published post must have a category. Category hubs are generated automatically and provide one guaranteed inbound route to each post. Once three or more posts are published, each post must also contain at least two contextual internal links.

The validator fails published orphan posts. Cross-site links across the portfolio are editorial-only; do not add reciprocal or sitewide links merely to manufacture authority.

## Structured data
Pages output JSON-LD as an `@graph`. The baseline graph uses Organization, WebSite, WebPage and BreadcrumbList. Posts add Article/BlogPosting-style entities, and local/commercial pages may opt into accurate supported types such as Place, LocalBusiness, TouristAttraction, Hotel, Restaurant, ItemList, Product or Review.

Only use a schema type when the visible page actually supports it. Do not create ratings, reviews, prices, availability, authors, locations, or business facts that are not present and verified.

## Affiliate links
Affiliate destinations must be registered in `data/affiliate.json`. Registered merchant links are rendered with `rel="sponsored nofollow"`. Pages that intentionally contain affiliate recommendations should set `affiliate: true`, which adds a visible disclosure notice linking to the sitewide Affiliate Disclosure page.

Editorial inclusion and ranking must not depend on affiliate status.
