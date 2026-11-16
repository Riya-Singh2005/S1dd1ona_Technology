# Siddiona campaign tracking

Use lowercase values consistently. Every campaign link should include `utm_source`, `utm_medium`, and `utm_campaign`. Use `utm_content` to distinguish creatives and `utm_term` only for paid keywords.

## Standard values

| Channel | Source | Medium | Example |
| --- | --- | --- | --- |
| Google Ads | `google` | `cpc` | `https://siddiona.com/?utm_source=google&utm_medium=cpc&utm_campaign=cloud_services` |
| Instagram organic | `instagram` | `social` | `https://siddiona.com/?utm_source=instagram&utm_medium=social&utm_campaign=company_awareness` |
| Instagram paid | `instagram` | `paid_social` | `https://siddiona.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=cloud_services` |
| WhatsApp | `whatsapp` | `messaging` | `https://siddiona.com/?utm_source=whatsapp&utm_medium=messaging&utm_campaign=cloud_services` |
| Email | list name | `email` | `https://siddiona.com/?utm_source=client_newsletter&utm_medium=email&utm_campaign=cloud_services` |
| Partner | partner name | `referral` | `https://siddiona.com/?utm_source=partner_name&utm_medium=referral&utm_campaign=cloud_services` |

Do not place names, email addresses, phone numbers, candidate references, or other personal data in UTM values. UTM values are case-sensitive in analytics reports; lowercase naming prevents one campaign from splitting into multiple rows.

Traffic appears in GA4 under **Reports → Acquisition → Traffic acquisition**. Career application attribution also appears on the corresponding admin application page. Contact attribution is included in the inquiry notification email.
