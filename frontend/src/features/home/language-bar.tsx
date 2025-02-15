function LanguageBar() {
    return (
        <>
            <div className="flex gap-6 rounded-t-xl hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img src="https://ant-seiko.com/icon/country/en.svg" alt="" />
                <p className="text-right flex-grow">English</p>
            </div>
            <div className="flex gap-6 hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img
                    src="https://ant-seiko.com/icon/country/ms-MY.svg"
                    alt=""
                />
                <p className="text-right flex-grow">Bahasa Malaysia</p>
            </div>
            <div className="flex gap-6 hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img
                    src="https://ant-seiko.com/icon/country/zh-CN.svg"
                    alt=""
                />
                <p className="text-right flex-grow">简体中文</p>
            </div>
            <div className="flex gap-6 hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img src="https://ant-seiko.com/icon/country/ko.svg" alt="" />
                <p className="text-right flex-grow">한국어</p>
            </div>
            <div className="flex gap-6 hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img src="https://ant-seiko.com/icon/country/ja.svg" alt="" />
                <p className="text-right flex-grow">日本語</p>
            </div>
            <div className="flex gap-6 hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img
                    className="border"
                    src="https://ant-seiko.com/icon/country/vi.svg"
                    alt=""
                />
                <p className="text-right flex-grow">Tiếng Việt</p>
            </div>
            <div className="flex gap-6 rounded-b-xl hover:bg-[#EBD19C] hover:text-black p-4 cursor-pointer ">
                <img src="https://ant-seiko.com/icon/country/ru.svg" alt="" />
                <p className="text-right flex-grow">Русский</p>
            </div>
        </>
    );
}

export default LanguageBar;
