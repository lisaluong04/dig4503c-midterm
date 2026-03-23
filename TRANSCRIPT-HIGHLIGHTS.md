# Transcript Highlights

## 1. Creating and connecting Neon database

I have minimal experience in backend programming, more so in configuring a database from scratch. I asked Claude "I deployed my website on netlify and am using Neon for the database. How would I implemet this into the login feature of my website." We discussed the steps to handle backend logic and proceeded one by one.\

## 2. Debugging the submit button

After adding a few features to the reviews feed, I manually tested each function. I found the submit button to make a post no longer worked and asked Claude why. Claude gave me two possible reasons for this bug and a way to see which fix would be needed. In result, it was found the migration hasn't been run yet and we debugged that issue in terminal.

## 3. Logic fixes

Throughout our chat history, I made sure to clearly define certain requirements. For example, "If the user has made a post, display review.html when they login", since I noticed upon logging in, it redirected to a page that didn't make sense if the user has submitted a post. Another example is "When on review.html the user should be able to see all posts made", which is a main feature for this feed-like page that Clause orginally overlooked.