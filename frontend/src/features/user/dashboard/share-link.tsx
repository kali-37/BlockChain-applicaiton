import {
    EmailIcon,
    EmailShareButton,
    TelegramIcon,
    TelegramShareButton,
    TwitterIcon,
    TwitterShareButton,
    ViberIcon,
    ViberShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from "react-share";

function ShareLink() {
    console.log("inside share link");
    const referalLink = `${window.location.origin}/?ref=${localStorage.getItem(
        "walletAddress"
    )}`;

    return (
        <div className="border bg-black p-4 rounded-xl space-y-4">
            <p className="text-gray-300 font-bold">Share referral link via :</p>
            <div className="flex gap-4 flex-wrap">
                <EmailShareButton url={referalLink}>
                    <EmailIcon round={true} size={40} />
                </EmailShareButton>
                <TelegramShareButton url={referalLink}>
                    <TelegramIcon round={true} size={40} />
                </TelegramShareButton>
                <WhatsappShareButton url={referalLink}>
                    <WhatsappIcon round={true} size={40} />
                </WhatsappShareButton>
                <TwitterShareButton url={referalLink}>
                    <TwitterIcon round={true} size={40} />
                </TwitterShareButton>
                <ViberShareButton url={referalLink}>
                    <ViberIcon round={true} size={40} />
                </ViberShareButton>
            </div>
        </div>
    );
}

export default ShareLink;
