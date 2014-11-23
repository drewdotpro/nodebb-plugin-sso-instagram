# NodeBB Instagram SSO

NodeBB Plugin that allows users to login/register via their Instagram account.

## Installation

    npm install nodebb-plugin-sso-instagram

## Configuration

1. Go to [Instagram Developer](http://instagram.com/developer)
1. Once signed in, click Register a New Client
1. Fill in all the details
1. Set your "OAuth redirect_uri" as the domain you access your NodeBB with `/auth/instagram/callback` appended to it (e.g. `https://www.mygreatwebsite.com/auth/instagram/callback`)
1. Click Register
1. Copy and paste Client ID and Client Secret