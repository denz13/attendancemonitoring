export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center ">
                <img
                    src="/images/lyceum.png"
                    alt="Lyceum San Pablo"
                    className="h-24 w-24 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Lyceum
                </span>
            </div>
        </>
    );
}
