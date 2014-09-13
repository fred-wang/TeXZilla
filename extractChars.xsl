<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
  <xsl:strip-space elements="*"/>
  <xsl:output method="text"/>

  <xsl:template match="charlist">

    <!-- We extract the list of characters from unicode.xml.
         For the LaTeX commands, we use the 'AMS' set as a reference modulo
         some modifications to match itex2MML's coverage.
         See isLaTeXCharacterCommand and addLaTeXCommands in
         generateCharCommands.py -->
    <xsl:apply-templates select="character"/>

    <!-- Some of the char combinations from itex2MML are not in unicode.xml,
         so we add them here. -->

    <xsl:text>U0003D-02237</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Eqcolon</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U02237-02212</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Coloneq</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U0003D-02237</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Eqqcolon</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U02212-02237</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Eqcolon</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U02236-02248</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\colonapprox</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U2237-02248</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Colonapprox</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U02236-0223C</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\colonsim</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

    <xsl:text>U02237-0223C</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>OP</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>\Colonsim</xsl:text>
    <xsl:text> </xsl:text>
    <xsl:text>&#xa;</xsl:text>

  </xsl:template>
  <xsl:template match="character">
    <!-- First handle the characters from the MathML operator dictionary -->
    <xsl:if test="operator-dictionary">
      <xsl:value-of select="@id"/>
      <xsl:text> </xsl:text>
      <xsl:text>OP</xsl:text>
      <xsl:if test="operator-dictionary/@fence">
        <xsl:text>F</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@movablelimits">
        <xsl:text>M</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@stretchy">
        <xsl:text>S</xsl:text>
      </xsl:if>
      <xsl:text> </xsl:text>
      <xsl:value-of select="AMS"/>
      <xsl:text>&#xa;</xsl:text>
    </xsl:if>
    <!-- Then handle the characters that have a mathclass as well as a few
         extra characters. -->
    <xsl:if test="not(operator-dictionary) and
                  (unicodedata/@mathclass or
                   boolean(@id = 'U00024') or
                   boolean(@id = 'U000F0') or
                   boolean(@id = 'U003C2') or
                   boolean(@id = 'U0228A-0FE00') or
                   boolean(@id = 'U02268-0FE00') or
                   boolean(@id = 'U02269-0FE00') or
                   boolean(@id = 'U0228B-0FE00') or
                   boolean(@id = 'U02ACB-0FE00') or
                   boolean(@id = 'U02ACC-0FE00'))">
      <xsl:value-of select="@id"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="unicodedata/@mathclass"/>
      <xsl:if test="not(unicodedata/@mathclass)">
        <xsl:text>?</xsl:text>
      </xsl:if>
      <xsl:text> </xsl:text>
      <xsl:value-of select="AMS"/>
      <xsl:text>&#xa;</xsl:text>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
