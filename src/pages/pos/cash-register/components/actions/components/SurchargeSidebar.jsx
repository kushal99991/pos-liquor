import { Button, Box } from "@mui/material";
import React from "react";

export default function SurchargeSidebar({ selectedType, setSelectedType }) {
    const buttons = [
        { key: "standard", label: "STANDARD\nSURCHARGE" },
        { key: "custom", label: "CUSTOM\nSURCHARGE" },
        { key: "multi_item", label: "MULTI ITEM\nSURCHARGE" },
    ];

    return (
        <Box sx={{ width: "140px", backgroundColor: "#e5e7eb", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {buttons.map((b, index) => (
                <Button
                    key={index}
                    onClick={() => setSelectedType(b.key)}
                    sx={{
                        backgroundColor: selectedType === b.key ? "#b91c1c" : "#000000",
                        color: "white",
                        padding: "28px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "4px",
                        textAlign: "center",
                        "&:hover": { backgroundColor: "#b91c1c" },
                    }}
                >
                    {b.label.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </Button>
            ))}
        </Box>
    );
}
