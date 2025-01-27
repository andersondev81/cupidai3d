import React from "react"
import Image from "next/image"

function ButtonIconSearch() {
  return (
    <div>
      {" "}
      <Image
        src="/svgs/icon/Search.svg"
        width={24}
        height={24}
        alt="Button Search Icon"
        className="m-2"
      />
    </div>
  )
}

export default ButtonIconSearch
