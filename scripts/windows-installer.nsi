Unicode true

!include "MUI2.nsh"

!ifndef APP_DIR
  !error "APP_DIR is required"
!endif
!ifndef OUTPUT_FILE
  !error "OUTPUT_FILE is required"
!endif
!ifndef PRODUCT_VERSION
  !error "PRODUCT_VERSION is required"
!endif

!define PRODUCT_NAME "OBI Quest"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\OBIQuest"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "${OUTPUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\OBI Quest"
InstallDirRegKey HKCU "Software\OBI Quest" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 64

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"

Section "Instalar OBI Quest" InstallSection
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "${APP_DIR}\*"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateDirectory "$SMPROGRAMS\OBI Quest"
  CreateShortcut "$SMPROGRAMS\OBI Quest\OBI Quest.lnk" "$INSTDIR\OBI Quest.exe"
  CreateShortcut "$SMPROGRAMS\OBI Quest\Desinstalar OBI Quest.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\OBI Quest.lnk" "$INSTDIR\OBI Quest.exe"

  WriteRegStr HKCU "Software\OBI Quest" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "OBI Quest"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\OBI Quest.lnk"
  Delete "$SMPROGRAMS\OBI Quest\OBI Quest.lnk"
  Delete "$SMPROGRAMS\OBI Quest\Desinstalar OBI Quest.lnk"
  RMDir "$SMPROGRAMS\OBI Quest"
  DeleteRegKey HKCU "${UNINSTALL_KEY}"
  DeleteRegKey HKCU "Software\OBI Quest"
  RMDir /r /REBOOTOK "$INSTDIR"
SectionEnd
