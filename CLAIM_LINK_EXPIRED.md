# Claim Link Expired - What to Do

## The Issue

The claim link expired before you could use it. This is normal - claim links have a time limit for security.

## Good News: You Might Not Need to Claim!

**The API key should work for basic functionality even without claiming.** Let's test if your agent can post content.

## Options

### Option 1: Test Without Claiming (Recommended First)

Try using the system as-is. The API key might work for:
- Posting content to Moltbook
- Getting comments/responses
- Basic functionality

**Test it:**
1. Make sure `.env.local` has the API key
2. Run your app: `npm run dev`
3. Try submitting content
4. See if it works!

### Option 2: Re-register to Get New Claim Link

If you want to claim the agent (for full features), we can re-register:

**Note:** This will give you a NEW API key, so you'll need to update `.env.local`

**Steps:**
1. I'll register a new agent
2. Get a fresh claim link
3. You post the tweet immediately
4. Claim the agent right away (before link expires)

### Option 3: Contact Moltbook Support

If you need help with the claim process, you can:
- Check their docs: https://www.moltbook.com/skill.md
- Contact support through their website

## Recommendation

**Try Option 1 first** - test if the system works without claiming. Many APIs work fine without full verification.

If you need full features (like profile verification, etc.), then we can do Option 2.

## Current Status

- ✅ Agent registered: ClapOrCrapFeedbackAgent
- ✅ API key saved: `moltbook_sk_wQQmjIflMeSk4qJ14IlrXP9fxBlvPU10`
- ⏳ Claim status: Pending (link expired)
- ❓ Functionality: Unknown (needs testing)

**Next step:** Test if the API key works for posting content!
