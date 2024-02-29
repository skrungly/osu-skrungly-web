from enum import IntFlag


class Mods(IntFlag):
    NM = 0
    NF = 1 << 0
    EZ = 1 << 1
    TS = 1 << 2  # old: 'NOVIDEO'
    HD = 1 << 3
    HR = 1 << 4
    SD = 1 << 5
    DT = 1 << 6
    RX = 1 << 7
    HT = 1 << 8
    NC = 1 << 9
    FL = 1 << 10
    # AUTOPLAY = 1 << 11
    SO = 1 << 12
    AP = 1 << 13
    PF = 1 << 14
    _4K = 1 << 15
    _5K = 1 << 16
    _6K = 1 << 17
    _7K = 1 << 18
    _8K = 1 << 19
    FI = 1 << 20
    RD = 1 << 21
    # CINEMA = 1 << 22
    TG = 1 << 23
    _9K = 1 << 24
    # KEYCOOP = 1 << 25
    _1K = 1 << 26
    _3K = 1 << 27
    _2K = 1 << 28
    V2 = 1 << 29
    MR = 1 << 30

    def __str__(self):
        if not self.value:
            return ""

        return "+" + self.name.replace("|", "").replace("_", "")
