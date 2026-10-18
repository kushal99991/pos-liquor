import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "hooks/useAuth";
import { BackOfficeRouteList } from "routes";
import BackOfficeBreadcrumbs from "./BackOfficeBreadcrumbs";
import BackOfficeHeader from "./BackOfficeHeader";

const BackOfficeLayout = () => {
  const { filterAdminMenuList } = useAuth();
  // console.log(filterAdminMenuList, "sidebar====filterAdminMenuList");

  // Use direct data from BackOfficeRoutesList
  const sidebarSections = filterAdminMenuList
    .filter((item) => item.isShowSidebar === true)
    .map((item) => ({
      ...item,
      subMenu: item.subMenu?.filter((sub) => sub.isShowSidebar === true) || [],
    }))
    .filter((item) => item.subMenu.length > 0 || item.path);

  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which accordion should be open based on current path
  const getActiveSection = () => {
    const path = location.pathname;
    for (const section of sidebarSections) {
      // Check if current path matches a direct link (no subMenu)
      const isDirectLink = section.path && (!section.subMenu || section.subMenu.length === 0);
      if (isDirectLink && (path === section.path || path.startsWith(section.path + "/"))) {
        // Don't open any accordion for direct links
        return null;
      }
      // Check if current path matches a subMenu item
      if (section.subMenu?.some(item => path === item.path || path.startsWith(item.path + "/"))) {
        return section.id;
      }
    }
    // Default to null (no accordion open) instead of "dashboard"
    return null;
  };

  const [openAccordion, setOpenAccordion] = useState(() => getActiveSection() || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isRootBackoffice = location.pathname === "/backoffice";

  
  // Update accordion when route changes
  useEffect(() => {
    setOpenAccordion(getActiveSection() || null);
  }, [location.pathname]);

  const handleAccordionChange = (id) => {
    setOpenAccordion(id === openAccordion ? "" : id);
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <Box className="h-screen w-full flex flex-col bg-gray-100">
      {!isRootBackoffice && <BackOfficeHeader />}

      <Box className="flex flex-1 overflow-hidden">
        {!isRootBackoffice && isSidebarOpen && (
          <Box
            sx={{
              width: 260,
              borderRight: "1px solid #e5e7eb",
            }}
            className="bg-white flex flex-col"
          >
            {/* Sidebar menu */}
            <Box className="flex-1 overflow-y-auto py-3">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const hasSubMenu = section.subMenu && section.subMenu.length > 0;
                const isDirectLink = section.path && !hasSubMenu;
                const isActive = hasSubMenu ? openAccordion === section.id : location.pathname === section.path;

                // Render direct link (no subMenu) as main menu item - same level as accordion headers
                if (isDirectLink) {
                  return (
                    <Box
                      key={section.id}
                      onClick={() => handleItemClick(section.path)}
                      sx={{
                        px: 1,
                        py: 1,
                        mb: 0.5,
                        cursor: "pointer",
                        backgroundColor: isActive ? "#f9eff1" : "transparent",
                        borderLeft: isActive ? "5px solid #9b243e" : "none",
                        "&:hover": {
                          backgroundColor: "#f9eff1",
                        },
                      }}
                    >
                      <Box
                        className="flex items-center gap-3 font-medium text-[#3e3e3e]"
                        sx={{
                          color: isActive ? "#9b243e" : "inherit",
                        }}
                      >
                        <Icon fontSize="small" />
                        {section.menuTitle}
                      </Box>
                    </Box>
                  );
                }

                // Render accordion (with subMenu)
                return (
                  <Accordion
                    key={section.id}
                    expanded={isActive}
                    onChange={() => handleAccordionChange(section.id)}
                    disableGutters
                    square
                    sx={{
                      boxShadow: "none",
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 1,
                        backgroundColor: isActive ? "#f9eff1" : "transparent",
                        borderLeft: isActive ? "5px solid #9b243e" : "none",
                      }}
                    >
                      <Box
                        className="flex items-center gap-3 font-medium text-[#3e3e3e]"
                        sx={{
                          color: isActive ? "#9b243e" : "inherit",
                        }}
                      >
                        <Icon fontSize="small" />
                        {section.menuTitle}
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ py: 0 }}>
                      <List disablePadding>
                        {section.subMenu?.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location.pathname === item.path;

                          return (
                            <ListItemButton
                              key={item.path}
                              onClick={() => handleItemClick(item.path)}
                              sx={{
                                ml: 1,
                                color: isItemActive ? "#9b243e" : "#444",
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 35 }}>
                                <ItemIcon
                                  fontSize="small"
                                  sx={{
                                    color: isItemActive ? "#9b243e" : "#444",
                                  }}
                                />
                              </ListItemIcon>

                              <ListItemText
                                primary={item.menuTitle}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                  fontWeight: isItemActive ? 600 : 400,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Main Content */}
        <Box className="flex-1 overflow-y-auto">
          {!isRootBackoffice && (
            <Box className="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <IconButton
                size="small"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
              </IconButton>
              <BackOfficeBreadcrumbs routes={BackOfficeRouteList} />
            </Box>
          )}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default BackOfficeLayout;