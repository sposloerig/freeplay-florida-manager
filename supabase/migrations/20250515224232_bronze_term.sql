-- Update admission FAQ with current pricing
UPDATE faqs 
SET answer = 'General admission is $16 for adults (tax included) and $10 for children ages 6-12 with a paying adult. Children under 6 are free with a paying adult. All games are set to free play after admission - no quarters needed!'
WHERE question = 'How much does it cost to visit?';

-- Add Late Night Date Night FAQ
INSERT INTO faqs (question, answer, category, order_number)
VALUES (
  'What is Late Night Date Night?',
  'Late Night Date Night is our special couples promotion available Fridays and Saturdays after 8pm. Two people can enjoy unlimited gameplay for just $26 (tax included)!',
  'Admission',
  15
);

-- Update hours of operation in relevant FAQs
UPDATE faqs 
SET answer = 'We are open Wednesday-Thursday 11am-7pm, Friday-Saturday 11am-11pm, and Sunday 11am-7pm. We are closed Mondays and Tuesdays. Special Late Night Date Night pricing is available Fridays and Saturdays after 8pm!'
WHERE question LIKE '%hours%' OR question LIKE '%when%open%';